import { confirmChatbotPreviewTransaksi } from '#/features/chatbot/chatbot.functions';
import { chatbotPreviewEventName, transaksiPreviewSchema, type TransaksiPreview } from '#/features/chatbot/chatbot.schema';
import { initialMessages } from '@/const/chatbot';
import { toastManager } from '@/components/selia/toast';
import { fetchServerSentEvents, useChat, type UIMessage } from '@tanstack/ai-react';
import { useRouter } from '@tanstack/react-router';
import { ArrowUp, Carrot, CornerDownLeft, ImagePlus } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../selia/button';
import { PopoverPopup } from '../selia/popover';
import { Textarea } from '../selia/textarea';

const maxUploadSizeInBytes = 5 * 1024 * 1024;

type ChatComposerPart =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'image';
      source: { type: 'data'; value: string; mimeType: string };
    };

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Coba lagi.';
}

function extractMessageText(message: UIMessage) {
  return message.parts
    .filter((part): part is Extract<UIMessage['parts'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.content)
    .join('');
}

function countImageParts(message: UIMessage) {
  return message.parts.filter((part) => part.type === 'image').length;
}

function createAssistantMessage(content: string): UIMessage {
  return {
    id: `chatbot-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: 'assistant',
    parts: [
      {
        type: 'text',
        content,
      },
    ],
  };
}

async function fileToBase64Payload(file: File) {
  return await new Promise<{ mimeType: string; value: string }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === 'string') {
        const [, payload] = result.split(',', 2);

        if (!payload) {
          reject(new Error('Format file gambar tidak valid.'));
          return;
        }

        resolve({
          mimeType: file.type || 'image/png',
          value: payload,
        });
        return;
      }

      reject(new Error('Gagal membaca file gambar.'));
    };

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3 text-[11px] leading-4'>
      <span className='text-muted'>{label}</span>
      <span className='text-right text-foreground'>{value || '-'}</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className='flex justify-start'>
      <div className='max-w-[85%] rounded-xl rounded-bl-sm bg-accent px-3 py-2 text-xs text-foreground'>
        <p className='text-[11px] text-muted'>Aimo sedang mengetik...</p>
        <div className='mt-1 flex items-center gap-1'>
          <span className='size-1.5 rounded-full bg-foreground/55 animate-pulse [animation-delay:0ms]' />
          <span className='size-1.5 rounded-full bg-foreground/55 animate-pulse [animation-delay:180ms]' />
          <span className='size-1.5 rounded-full bg-foreground/55 animate-pulse [animation-delay:360ms]' />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const [draft, setDraft] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<TransaksiPreview | null>(null);
  const [isConfirmingPreview, setIsConfirmingPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const latestErrorRef = useRef<string | null>(null);
  const router = useRouter();

  const {
    messages,
    sendMessage,
    setMessages,
    isLoading,
    error,
  } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    initialMessages,
    onCustomEvent: (eventType, value) => {
      if (eventType !== chatbotPreviewEventName) {
        return;
      }

      const preview = transaksiPreviewSchema.safeParse(value);

      if (!preview.success) {
        return;
      }

      setPendingPreview(preview.data);
    },
  });

  const deferredMessages = useDeferredValue(messages);

  const renderedMessages = useMemo(
    () =>
      deferredMessages
        .map((message) => ({
          ...message,
          text: extractMessageText(message),
          imageCount: countImageParts(message),
        }))
        .filter((message) => message.text || message.imageCount > 0),
    [deferredMessages],
  );

  useEffect(() => {
    if (!error || latestErrorRef.current === error.message) {
      return;
    }

    latestErrorRef.current = error.message;

    toastManager.add({
      type: 'error',
      title: 'Chatbot error',
      description: error.message,
    });
  }, [error]);

  useEffect(() => {
    const node = textareaRef.current;

    if (!node) {
      return;
    }

    node.style.height = '0px';
    node.style.height = `${Math.min(node.scrollHeight, 144)}px`;
  }, [draft]);

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    const message = draft.trim();
    const nextAttachmentFile = attachmentFile;

    if (!message && !nextAttachmentFile) {
      return;
    }

    try {
      setPendingPreview(null);
      setDraft('');
      clearAttachment();

      const contentParts: ChatComposerPart[] = [];

      const promptText = message || (nextAttachmentFile ? 'Tolong bantu baca struk ini dan siapkan preview transaksi.' : '');

      if (promptText) {
        contentParts.push({
          type: 'text',
          content: promptText,
        });
      }

      if (nextAttachmentFile) {
        const imagePayload = await fileToBase64Payload(nextAttachmentFile);

        contentParts.push({
          type: 'image',
          source: {
            type: 'data',
            value: imagePayload.value,
            mimeType: imagePayload.mimeType,
          },
        });
      }

      await sendMessage(
        contentParts.length === 1 && contentParts[0]?.type === 'text'
          ? contentParts[0].content || ''
          : { content: contentParts },
      );
    } catch (sendError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mengirim pesan',
        description: getErrorMessage(sendError),
      });
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSend();
  };

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      clearAttachment();
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      toastManager.add({
        type: 'error',
        title: 'Format file belum didukung',
        description: 'Upload gambar struk dalam format image.',
      });
      clearAttachment();
      return;
    }

    if (selectedFile.size > maxUploadSizeInBytes) {
      toastManager.add({
        type: 'error',
        title: 'File terlalu besar',
        description: 'Maksimal ukuran gambar adalah 5 MB.',
      });
      clearAttachment();
      return;
    }

    setAttachmentFile(selectedFile);
    setAttachmentName(selectedFile.name);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmPreview = async () => {
    if (!pendingPreview || !pendingPreview.canConfirm || isConfirmingPreview) {
      return;
    }

    try {
      setIsConfirmingPreview(true);

      await confirmChatbotPreviewTransaksi({
        data: pendingPreview,
      });

      setPendingPreview(null);
      setMessages([...messages, createAssistantMessage('Transaksi berhasil disimpan ke tabel.')]);
      toastManager.add({
        type: 'success',
        title: 'Berhasil',
        description: 'Transaksi baru sudah ditambahkan.',
      });

      await router.invalidate();
    } catch (confirmError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menyimpan transaksi',
        description: getErrorMessage(confirmError),
      });
    } finally {
      setIsConfirmingPreview(false);
    }
  };

  return (
    <PopoverPopup side='top' align='end' sideOffset={14} className='w-[min(92vw,23rem)] p-0 gap-0 overflow-hidden rounded-xl'>
      <div className='w-full border-b border-popover-separator px-4 py-3'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <p className='text-sm font-medium leading-none'>Eltrack Assistant</p>
          </div>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-1 text-[10px] font-medium text-muted'>
            <Carrot className='size-3' />
            AI
          </span>
        </div>
      </div>

      <div className='w-full max-h-72 overflow-y-auto px-4 py-3 space-y-3'>
        {renderedMessages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={message.role === 'user' ? 'max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground' : 'max-w-[85%] rounded-xl rounded-bl-sm bg-accent px-3 py-2 text-xs text-foreground'}>
              {message.text ? <p className='whitespace-pre-wrap'>{message.text}</p> : null}
              {message.imageCount > 0 ? (
                <p className={`mt-1 text-[10px] ${message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted'}`}>
                  Foto terlampir{message.imageCount > 1 ? ` (${message.imageCount})` : ''}
                </p>
              ) : null}
            </div>
          </div>
        ))}

        {isLoading ? <TypingIndicator /> : null}

        {pendingPreview ? (
          <div className='rounded-xl border border-card-separator bg-card px-3 py-3 text-xs shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='font-medium text-foreground'>Preview transaksi</p>
                <p className='mt-1 text-[10px] text-muted'>Cek dulu sebelum disimpan ke tabel.</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                  pendingPreview.canConfirm ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}
              >
                {pendingPreview.canConfirm ? 'Siap disimpan' : 'Perlu dicek'}
              </span>
            </div>

            <div className='mt-3 space-y-2'>
              <PreviewField label='Nama' value={pendingPreview.namaTransaksi || '-'} />
              <PreviewField label='Tanggal' value={pendingPreview.tanggal || '-'} />
              <PreviewField label='Waktu' value={pendingPreview.waktu || '-'} />
              <PreviewField label='Nominal' value={pendingPreview.nominal != null ? `Rp ${new Intl.NumberFormat('id-ID').format(pendingPreview.nominal)}` : '-'} />
              <PreviewField label='Kategori' value={pendingPreview.kategoriName || '-'} />
              <PreviewField label='Metode' value={pendingPreview.metodePembayaranName || '-'} />
              <PreviewField label='Tipe' value={pendingPreview.tipeName || '-'} />
              <PreviewField label='Catatan' value={pendingPreview.catatan || '-'} />
            </div>

            {pendingPreview.missingFields.length > 0 ? (
              <div className='mt-3 rounded-lg border border-warning/25 bg-warning/8 px-2.5 py-2 text-[11px] text-warning'>
                <p className='font-medium'>Masih perlu dicek:</p>
                <ul className='mt-1 list-disc pl-4'>
                  {pendingPreview.missingFields.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {pendingPreview.confidenceNotes.length > 0 ? (
              <div className='mt-3 rounded-lg border border-card-separator bg-accent/70 px-2.5 py-2 text-[11px] text-muted'>
                <p className='font-medium text-foreground'>Catatan AI:</p>
                <ul className='mt-1 list-disc pl-4'>
                  {pendingPreview.confidenceNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className='mt-3 flex items-center justify-end gap-2'>
              <Button size='sm' variant='plain' className='ring-0 text-xs' onClick={() => setPendingPreview(null)}>
                Batal
              </Button>
              <Button size='sm' variant='primary' className='ring-0 text-xs' disabled={!pendingPreview.canConfirm || isConfirmingPreview} onClick={handleConfirmPreview}>
                {isConfirmingPreview ? 'Menyimpan...' : 'Konfirmasi simpan'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className='w-full border-t border-popover-separator px-3.5 py-3'>
        <div className='rounded-xl border border-input-border/80 bg-input/50 px-2.5 py-2 transition-[border-color,box-shadow] focus-within:border-primary/65 focus-within:shadow-sm'>
          <input ref={fileInputRef} type='file' accept='image/*' className='hidden' aria-label='Upload foto chatbot' title='Upload foto chatbot' onChange={handleAttachmentSelect} />
          <Textarea
            ref={textareaRef}
            value={draft}
            variant='notion'
            rows={1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder='Tanya apa saja...'
            className='min-h-0 max-h-36 resize-none overflow-y-auto pl-1 pr-0 py-0 text-xs leading-5 placeholder:text-dimmed '
          />
          {attachmentName ? <p className='mt-2 truncate text-[10px] text-muted'>Foto dipilih: {attachmentName}</p> : null}
          <div className='mt-2 flex items-center justify-between'>
            <p className='inline-flex items-center gap-1 text-[10px] text-muted'>
              <CornerDownLeft className='size-3' />
              Enter kirim, Shift+Enter baris baru
            </p>
            <div className='flex items-center gap-1.5'>
              <Button size='xs-icon' variant='plain' className='ring-0 size-7 rounded-lg text-muted hover:text-foreground' onClick={handleAttachmentClick} aria-label='Upload foto'>
                <ImagePlus className='size-3.5' />
              </Button>
              <Button size='xs-icon' variant='primary' className='ring-0 text-accent/80 size-7 rounded-lg' onClick={() => void handleSend()} disabled={isLoading}>
                <ArrowUp className='size-3.5' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PopoverPopup>
  );
}
