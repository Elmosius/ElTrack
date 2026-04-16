import type { UIMessage } from '@tanstack/ai-react';
import { photoPlaceholderText } from '@/const/chatbot';
import type { TransaksiPreviewGroup } from '#/types/chatbot';

export type RenderedChatMessage = UIMessage & {
  text: string;
  imageCount: number;
};

const previewStatusMessagePattern =
  /preview transaksi|siap disimpan|masih ada field|masih perlu dicek/i;
const savedPreviewClaimPattern =
  /(berhasil disimpan|sudah berhasil disimpan|sudah disimpan|ditambahkan ke tabel)/i;

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

export function sanitizeAssistantPreviewResponseMessage(
  message: UIMessage,
  preview: TransaksiPreviewGroup | null,
) {
  const text = extractMessageText(message);

  if (
    message.role !== 'assistant' ||
    !text ||
    !preview ||
    !savedPreviewClaimPattern.test(text)
  ) {
    return message;
  }

  return {
    id: message.id,
    role: 'assistant',
    parts: [
      {
        type: 'text',
        content: 'Preview transaksi sudah diperbarui. Cek dulu sebelum disimpan ke tabel.',
      },
    ],
  } satisfies UIMessage;
}

export function toRenderedChatMessages(
  messages: UIMessage[],
): RenderedChatMessage[] {
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
