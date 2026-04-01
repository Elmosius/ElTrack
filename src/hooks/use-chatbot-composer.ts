import {
  fileToBase64Payload,
  type ChatComposerPayload,
  type ChatComposerPart,
} from '#/lib/chatbot';
import { maxUploadSizeInBytes } from '@/const/chatbot';
import { toastManager } from '@/components/selia/toast';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseChatbotComposerOptions = {
  resetVersion: number;
  onSubmit: (payload: ChatComposerPayload) => Promise<void>;
};

export function useChatbotComposer({
  resetVersion,
  onSubmit,
}: UseChatbotComposerOptions) {
  const [draft, setDraft] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
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

  const clearAttachment = useCallback(() => {
    setAttachmentFile(null);
    setAttachmentName('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const resetComposer = useCallback(() => {
    setDraft('');
    clearAttachment();
  }, [clearAttachment]);

  useEffect(() => {
    resetComposer();
  }, [resetComposer, resetVersion]);

  const handleAttachmentSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        description: 'Maksimal ukuran file asli adalah 8 MB.',
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

  const buildMessagePayload = useCallback(
    async (): Promise<ChatComposerPayload | null> => {
      const message = draft.trim();
      const nextAttachmentFile = attachmentFile;

      if (!message && !nextAttachmentFile) {
        return null;
      }

      const contentParts: ChatComposerPart[] = [];
      const promptText =
        message ||
        (nextAttachmentFile
          ? 'Tolong bantu baca struk ini dan siapkan preview transaksi.'
          : '');

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

      return contentParts.length === 1 && contentParts[0]?.type === 'text'
        ? contentParts[0].content || ''
        : { content: contentParts };
    },
    [attachmentFile, draft],
  );

  const handleSend = useCallback(async () => {
    try {
      const payload = await buildMessagePayload();

      if (!payload) {
        return;
      }

      resetComposer();
      await onSubmit(payload);
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal memproses foto',
        description:
          error instanceof Error
            ? error.message
            : 'Coba lagi dengan gambar yang lebih kecil.',
      });
    }
  }, [buildMessagePayload, onSubmit, resetComposer]);

  const handleComposerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return;
      }

      event.preventDefault();
      void handleSend();
    },
    [handleSend],
  );

  return {
    state: {
      draft,
      attachmentName,
    },
    actions: {
      setDraft,
      handleAttachmentSelect,
      handleAttachmentClick,
      handleComposerKeyDown,
      handleSend,
    },
    refs: {
      textareaRef,
      fileInputRef,
    },
  };
}
