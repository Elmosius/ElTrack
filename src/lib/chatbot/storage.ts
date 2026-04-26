import type { UIMessage } from '@tanstack/ai-react';
import { photoPlaceholderText } from '@/const/chatbot';

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
