import type { UIMessage } from '@tanstack/ai-react';

export const maxUploadSizeInBytes = 5 * 1024 * 1024;
export const photoPlaceholderText = '[Foto terlampir]';
export const defaultChatSessionTitleLabel = 'Chat baru';

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
] as UIMessage[];
