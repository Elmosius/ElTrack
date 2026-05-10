import { describe, expect, it } from 'vitest';
import type { UIMessage } from '@tanstack/ai-react';
import { sanitizeAssistantPreviewResponseMessage } from './preview-message-sanitizer';

describe('sanitizeAssistantPreviewResponseMessage', () => {
  it('replaces hallucinated preview JSON when no preview event is active', () => {
    const message = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          content:
            '```json\n{"items":[{"namaTransaksi":"test","nominal":null}]}\n```\nPreview transaksi untuk "test" sudah siap ditinjau.',
        },
      ],
    } as UIMessage;

    expect(sanitizeAssistantPreviewResponseMessage(message, null)).toEqual({
      id: 'assistant-1',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          content:
            'Aku membaca ini sebagai chat biasa, bukan transaksi. Kalau mau mencatat transaksi, tulis detail transaksinya ya.',
        },
      ],
    });
  });

  it('keeps ordinary chat responses when no preview event is active', () => {
    const message = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [{ type: 'text', content: 'Halo! Ada yang bisa saya bantu?' }],
    } as UIMessage;

    expect(sanitizeAssistantPreviewResponseMessage(message, null)).toBe(message);
  });
});
