import { describe, expect, it } from 'vitest';
import type { UIMessage } from '@tanstack/ai';
import { previewDismissedMarkerText } from '#/lib/chatbot';
import { sanitizeMessagesForModel } from './chatbot-stream-utils.server';

describe('sanitizeMessagesForModel', () => {
  it('drops non-text assistant parts before sending history to the model', () => {
    const messages = [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          { type: 'text', content: 'Preview sudah siap.' },
          { type: 'tool-call', toolName: 'preview_transaksi' },
          { type: 'custom', event: 'transaksi-preview-ready' },
        ],
      },
    ] as unknown as UIMessage[];

    expect(sanitizeMessagesForModel(messages)).toEqual([
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', content: 'Preview sudah siap.' }],
      },
    ]);
  });

  it('keeps user images for vision requests', () => {
    const messages = [
      {
        id: 'user-1',
        role: 'user',
        parts: [
          { type: 'text', content: 'Tolong baca struk ini' },
          { type: 'image', image: 'data:image/png;base64,abc' },
        ],
      },
    ] as unknown as UIMessage[];

    expect(sanitizeMessagesForModel(messages)).toEqual(messages);
  });

  it('drops assistant preview text from chat-mode model history', () => {
    const messages = [
      {
        id: 'assistant-preview',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            content:
              'Preview transaksi (1)\nCek dulu sebelum disimpan ke tabel.',
          },
        ],
      },
      {
        id: 'user-chat',
        role: 'user',
        parts: [{ type: 'text', content: 'test' }],
      },
    ] as unknown as UIMessage[];

    expect(
      sanitizeMessagesForModel(messages, { stripPreviewAssistantText: true }),
    ).toEqual([
      {
        id: 'user-chat',
        role: 'user',
        parts: [{ type: 'text', content: 'test' }],
      },
    ]);
  });

  it('drops all history before the latest preview dismissal marker', () => {
    const messages = [
      {
        id: 'old-user',
        role: 'user',
        parts: [{ type: 'text', content: 'Tolong catat isi bensin' }],
      },
      {
        id: 'dismissed',
        role: 'system',
        parts: [{ type: 'text', content: previewDismissedMarkerText }],
      },
      {
        id: 'new-user',
        role: 'user',
        parts: [{ type: 'text', content: 'test' }],
      },
    ] as unknown as UIMessage[];

    expect(sanitizeMessagesForModel(messages)).toEqual([
      {
        id: 'new-user',
        role: 'user',
        parts: [{ type: 'text', content: 'test' }],
      },
    ]);
  });
});
