import type { UIMessage } from '@tanstack/ai-react';

export const maxUploadSizeInBytes = 8 * 1024 * 1024;
export const targetUploadSizeInBytes = 2 * 1024 * 1024;
export const maxUploadDimensionInPixels = 1600;
export const photoPlaceholderText = '[Foto terlampir]';
export const defaultChatSessionTitleLabel = 'Chat baru';
export const chatbotInsightQuickPrompts = [
  'Kasih saran hemat',
  'Aku boros di mana?',
  'Gimana kondisi bulan ini?',
  'Ada risiko yang perlu dicek?',
] as const;

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
