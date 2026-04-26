import {
  type ChatComposerPayload,
} from '#/lib/chatbot';
import { toastManager } from '@/components/selia/toast';
import { useCallback, useRef, useState } from 'react';
import {
  useChatbotComposerAutoResize,
  useChatbotComposerReset,
} from './use-chatbot-composer.effects';
import {
  buildChatComposerPayload,
  getAttachmentValidationError,
} from './use-chatbot-composer.helpers';

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

  useChatbotComposerAutoResize(textareaRef, draft);

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

  useChatbotComposerReset(resetComposer, resetVersion);

  const handleAttachmentSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      clearAttachment();
      return;
    }

    const validationError = getAttachmentValidationError(selectedFile);

    if (validationError) {
      toastManager.add({
        type: 'error',
        title: validationError.title,
        description: validationError.description,
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
      return buildChatComposerPayload(draft, attachmentFile);
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
