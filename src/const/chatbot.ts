import type { ChatMessage } from '#/types/chatbot';

export const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Halo! Aku Aimo. Aku siap membantu kamu apa pun!',
  },
  {
    id: 2,
    role: 'user',
    text: 'Boleh bantu bikin ringkasan pemasukan minggu ini?',
  },
  {
    id: 3,
    role: 'assistant',
    text: 'Siap. Mock ini belum terhubung data, tapi tampilannya sudah siap untuk alur chat.',
  },
] satisfies ChatMessage[];
