import type { UIMessage } from '@tanstack/ai-react';

export const maxUploadSizeInBytes = 5 * 1024 * 1024;
export const photoPlaceholderText = '[Foto terlampir]';

export type ChatComposerPart =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'image';
      source: { type: 'data'; value: string; mimeType: string };
    };

export type RenderedChatMessage = UIMessage & {
  text: string;
  imageCount: number;
};

const previewStatusMessagePattern =
  /preview transaksi|siap disimpan|masih ada field|masih perlu dicek/i;

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Coba lagi.';
}

export function extractMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (
        part,
      ): part is Extract<UIMessage['parts'][number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.content)
    .join('');
}

export function countImageParts(message: UIMessage) {
  return message.parts.filter((part) => part.type === 'image').length;
}

export function sanitizeMessageForStorage(message: UIMessage): UIMessage {
  const sanitizedParts = message.parts.flatMap((part) => {
    if (part.type === 'image') {
      return [
        {
          type: 'text' as const,
          content: photoPlaceholderText,
        },
      ];
    }

    return [part];
  });

  return {
    id: message.id,
    role: message.role,
    parts: sanitizedParts,
  };
}

export function sanitizeMessagesForStorage(messages: UIMessage[]) {
  return messages.map((message) => sanitizeMessageForStorage(message));
}

export function createAssistantMessage(content: string): UIMessage {
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

export async function fileToBase64Payload(file: File) {
  return await new Promise<{ mimeType: string; value: string }>(
    (resolve, reject) => {
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
    },
  );
}

export function toRenderedChatMessages(messages: UIMessage[]): RenderedChatMessage[] {
  return messages
    .map((message) => ({
      ...message,
      text: extractMessageText(message),
      imageCount: countImageParts(message),
    }))
    .filter((message) => message.text || message.imageCount > 0);
}

export function isPreviewStatusMessage(message: RenderedChatMessage) {
  return (
    message.role === 'assistant' &&
    Boolean(message.text) &&
    previewStatusMessagePattern.test(message.text)
  );
}

export function createChatSessionTitle(rawText: string | null | undefined) {
  const normalized = rawText
    ?.replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return 'Chat baru';
  }

  return normalized.length > 48
    ? `${normalized.slice(0, 45).trimEnd()}...`
    : normalized;
}
