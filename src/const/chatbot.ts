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
  {
    id: 'chatbot-welcome-2',
    role: 'user',
    parts: [
      {
        type: 'text',
        content: 'Boleh bantu bikin ringkasan pemasukan minggu ini?',
      },
    ],
  },
  {
    id: 'chatbot-welcome-3',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        content: 'Sekarang aku juga bisa bantu baca foto struk dan menyiapkan preview transaksi sebelum disimpan.',
      },
    ],
  },
] satisfies UIMessage[];
