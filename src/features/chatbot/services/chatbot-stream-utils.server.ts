import {
  convertMessagesToModelMessages,
  type ModelMessage,
  type UIMessage,
} from '@tanstack/ai';

export function withSystemPrompt(
  messages: Array<UIMessage | ModelMessage>,
  systemPrompt: string,
) {
  return [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    ...convertMessagesToModelMessages(messages),
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
