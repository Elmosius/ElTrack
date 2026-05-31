import type { UIMessage } from '@tanstack/ai-react';

export const previewDismissedMarkerText = '__ELTRACK_PREVIEW_DISMISSED__';

export function isPreviewDismissedMarker(message: {
  role: string;
  parts?: Array<{ type?: string; content?: unknown }>;
}) {
  return (
    message.role === 'system' &&
    Array.isArray(message.parts) &&
    message.parts.some(
      (part) =>
        part.type === 'text' && part.content === previewDismissedMarkerText,
    )
  );
}

export function createPreviewDismissedMarkerMessage(): UIMessage {
  return {
    id: `chatbot-dismissed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: 'system',
    parts: [
      {
        type: 'text',
        content: previewDismissedMarkerText,
      },
    ],
  };
}
