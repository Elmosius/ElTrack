import type { UIMessage } from '@tanstack/ai-react';
import { photoPlaceholderText } from '@/const/chatbot';

export type RenderedChatMessage = UIMessage & {
  text: string;
  imageCount: number;
};

const previewStatusMessagePattern =
  /preview transaksi|siap disimpan|masih ada field|masih perlu dicek/i;

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
