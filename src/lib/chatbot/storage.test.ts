import { describe, expect, it } from 'vitest';
import type { UIMessage } from '@tanstack/ai-react';
import { sanitizeMessageForStorage } from './storage';

describe('sanitizeMessageForStorage', () => {
  it('stores only safe text parts from assistant messages', () => {
    const message = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [
        { type: 'text', content: 'Preview sudah siap.' },
        { type: 'tool-call', toolName: 'preview_transaksi' },
        { type: 'custom', event: 'transaksi-preview-ready' },
      ],
    } as unknown as UIMessage;

    expect(sanitizeMessageForStorage(message)).toEqual({
      id: 'assistant-1',
      role: 'assistant',
      parts: [{ type: 'text', content: 'Preview sudah siap.' }],
    });
  });
});
