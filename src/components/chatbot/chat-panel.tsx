import type { ChatMessage } from '#/types/chatbot';
import { initialMessages } from '@/const/chatbot';
import { ArrowUp, Carrot, CornerDownLeft, ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../selia/button';
import { PopoverPopup } from '../selia/popover';
import { Textarea } from '../selia/textarea';

export function ChatPanel() {
  const [draft, setDraft] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([...initialMessages]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const node = textareaRef.current;

    if (!node) {
      return;
    }

    node.style.height = '0px';
    node.style.height = `${Math.min(node.scrollHeight, 144)}px`;
  }, [draft]);

  const handleSend = () => {
    const message = draft.trim();
    const hasAttachment = Boolean(attachmentName);

    if (!message && !hasAttachment) {
      return;
    }

    const composedMessage = [message, hasAttachment ? `[Foto] ${attachmentName}` : ''].filter(Boolean).join('\n');

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        role: 'user',
        text: composedMessage,
      },
      {
        id: prev.length + 2,
        role: 'assistant',
        text: 'Noted. Ini masih mock response, tapi alur percakapannya sudah berjalan.',
      },
    ]);

    setDraft('');
    setAttachmentName('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSend();
  };

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setAttachmentName(selectedFile?.name || '');
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
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
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p className={message.role === 'user' ? 'max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground' : 'max-w-[85%] rounded-xl rounded-bl-sm bg-accent px-3 py-2 text-xs text-foreground'}>
              {message.text}
            </p>
          </div>
        ))}
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
              <Button size='xs-icon' variant='primary' className='ring-0 text-accent/80 size-7 rounded-lg' onClick={handleSend}>
                <ArrowUp className='size-3.5' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PopoverPopup>
  );
}
