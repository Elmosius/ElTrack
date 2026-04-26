import { fileToBase64Payload, type ChatComposerPart } from '#/lib/chatbot';
import { maxUploadSizeInBytes } from '@/const/chatbot';

export function getAttachmentValidationError(file: File) {
  if (!file.type.startsWith('image/')) {
    return {
      title: 'Format file belum didukung',
      description: 'Upload gambar struk dalam format image.',
    };
  }

  if (file.size > maxUploadSizeInBytes) {
    return {
      title: 'File terlalu besar',
      description: 'Maksimal ukuran file asli adalah 8 MB.',
    };
  }

  return null;
}

export async function buildChatComposerPayload(
  draft: string,
  attachmentFile: File | null,
) {
  const message = draft.trim();

  if (!message && !attachmentFile) {
    return null;
  }

  const contentParts: ChatComposerPart[] = [];
  const promptText =
    message ||
    (attachmentFile
      ? 'Tolong bantu baca struk ini dan siapkan preview transaksi.'
      : '');

  if (promptText) {
    contentParts.push({
      type: 'text',
      content: promptText,
    });
  }

  if (attachmentFile) {
    const imagePayload = await fileToBase64Payload(attachmentFile);

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
}
