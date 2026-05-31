import { describe, expect, it } from 'vitest';
import type { UIMessage } from '@tanstack/ai-react';
import { previewDismissedMarkerText } from './dismiss-marker';
import { toRenderedChatMessages } from './render';

describe('toRenderedChatMessages', () => {
  it('does not render internal preview dismissal markers', () => {
    const messages = [
      {
        id: 'dismissed',
        role: 'system',
        parts: [{ type: 'text', content: previewDismissedMarkerText }],
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', content: 'Halo!' }],
      },
    ] as unknown as UIMessage[];

    expect(toRenderedChatMessages(messages)).toEqual([
      expect.objectContaining({
        id: 'assistant-1',
        text: 'Halo!',
      }),
    ]);
  });
});
