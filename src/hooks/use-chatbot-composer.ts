import {
  fileToBase64Payload,
  maxUploadSizeInBytes,
  type ChatComposerPart,
} from '#/lib/chatbot';
import { toastManager } from '@/components/selia/toast';
import { useEffect, useRef, useState } from 'react';

type ChatComposerPayload = string | { content: ChatComposerPart[] };

export function useChatbotComposer() {
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

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetComposer = () => {
    setDraft('');
    clearAttachment();
  };

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

  const buildMessagePayload = async (): Promise<ChatComposerPayload | null> => {
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
  };

  return {
    state: {
      draft,
      attachmentName,
    },
    actions: {
      setDraft,
      handleAttachmentSelect,
      handleAttachmentClick,
      resetComposer,
      buildMessagePayload,
    },
    refs: {
      textareaRef,
      fileInputRef,
    },
  };
}
