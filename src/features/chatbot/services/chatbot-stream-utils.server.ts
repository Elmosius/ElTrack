import {
  convertMessagesToModelMessages,
  type ModelMessage,
  type UIMessage,
} from '@tanstack/ai';

type UiMessagePart = UIMessage['parts'][number];
type ModelMessageContentPart = Exclude<
  ModelMessage['content'],
  string | null
>[number];

type SanitizeMessagesForModelOptions = {
  stripPreviewAssistantText?: boolean;
};

const previewAssistantHistoryPattern =
  /```json[\s\S]*"items"\s*:|preview transaksi|siap disimpan|siap ditinjau|cek dulu sebelum disimpan|masih perlu dicek|namaTransaksi|"nominal"\s*:|"kategori"\s*:|"metodePembayaran"\s*:/i;

function shouldStripPreviewAssistantHistory(
  message: UIMessage | ModelMessage,
  options: SanitizeMessagesForModelOptions,
) {
  return (
    Boolean(options.stripPreviewAssistantText) &&
    message.role === 'assistant' &&
    previewAssistantHistoryPattern.test(extractMessageText(message))
  );
}

function sanitizeUiMessageForModel(message: UIMessage): UIMessage | null {
  const parts: UiMessagePart[] = [];

  for (const part of message.parts) {
    if (part.type === 'text') {
      parts.push(part);
      continue;
    }

    if (message.role === 'user' && part.type === 'image') {
      parts.push(part as UiMessagePart);
    }
  }

  if (parts.length === 0) {
    return null;
  }

  return {
    ...message,
    parts,
  };
}

function sanitizeModelMessageForModel(message: ModelMessage): ModelMessage | null {
  if (typeof message.content === 'string') {
    return message.content.trim() ? message : null;
  }

  if (!message.content) {
    return null;
  }

  if (!Array.isArray(message.content)) {
    return message;
  }

  const content: ModelMessageContentPart[] = [];

  for (const part of message.content) {
    if (
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      part.type === 'text'
    ) {
      content.push(part as ModelMessageContentPart);
      continue;
    }

    if (
      message.role === 'user' &&
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      part.type === 'image'
    ) {
      content.push(part as ModelMessageContentPart);
    }
  }

  if (content.length === 0) {
    return null;
  }

  return {
    ...message,
    content,
  } as ModelMessage;
}

export function sanitizeMessagesForModel(
  messages: Array<UIMessage | ModelMessage>,
  options: SanitizeMessagesForModelOptions = {},
): Array<UIMessage | ModelMessage> {
  const sanitizedMessages: Array<UIMessage | ModelMessage> = [];

  for (const message of messages) {
    if (shouldStripPreviewAssistantHistory(message, options)) {
      continue;
    }

    if ('parts' in message && Array.isArray(message.parts)) {
      const sanitizedMessage = sanitizeUiMessageForModel(message);
      if (sanitizedMessage) {
        sanitizedMessages.push(sanitizedMessage);
      }
      continue;
    }

    const sanitizedMessage = sanitizeModelMessageForModel(message as ModelMessage);
    if (sanitizedMessage) {
      sanitizedMessages.push(sanitizedMessage);
    }
  }

  return sanitizedMessages;
}

export function withSystemPrompt(
  messages: Array<UIMessage | ModelMessage>,
  systemPrompt: string,
  options: SanitizeMessagesForModelOptions = {},
) {
  return [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    ...convertMessagesToModelMessages(sanitizeMessagesForModel(messages, options)),
  ] as ModelMessage[];
}

export function hasImageContent(messages: Array<UIMessage | ModelMessage>) {
  return messages.some((message) => {
    const content =
      'parts' in message && Array.isArray(message.parts)
        ? message.parts
        : 'content' in message && Array.isArray(message.content)
          ? message.content
          : [];

    return content.some(
      (part) =>
        typeof part === 'object' &&
        part !== null &&
        'type' in part &&
        part.type === 'image',
    );
  });
}

export function extractMessageText(message: UIMessage | ModelMessage) {
  if ('parts' in message && Array.isArray(message.parts)) {
    return message.parts
      .filter(
        (
          part,
        ): part is Extract<UIMessage['parts'][number], { type: 'text' }> =>
          part.type === 'text',
      )
      .map((part) => part.content)
      .join('')
      .trim();
  }

  if ('content' in message && Array.isArray(message.content)) {
    return message.content
      .flatMap((part) => {
        if (typeof part === 'string') {
          return [part];
        }

        if (
          typeof part === 'object' &&
          part !== null &&
          'type' in part &&
          part.type === 'text' &&
          'text' in part &&
          typeof part.text === 'string'
        ) {
          return [part.text];
        }

        return [];
      })
      .join('')
      .trim();
  }

  return '';
}

export function getLatestUserMessageText(
  messages: Array<UIMessage | ModelMessage>,
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message?.role !== 'user') {
      continue;
    }

    const text = extractMessageText(message);

    if (text) {
      return text;
    }
  }

  return null;
}
