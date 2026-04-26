import type { UIMessage } from '@tanstack/ai-react';

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
