import type { UIMessage } from '@tanstack/ai-react';

export const initialMessages = [
  {
    id: 'chatbot-welcome-1',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        content: 'Halo! Aku Aimo. Aku siap membantu kamu apa pun!',
      },
    ],
  },
] satisfies UIMessage[];
