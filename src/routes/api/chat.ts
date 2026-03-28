import { toServerSentEventsResponse } from '@tanstack/ai';
import type { ModelMessage, UIMessage } from '@tanstack/ai';
import { createFileRoute } from '@tanstack/react-router';
import { auth } from '#/lib/auth.server';
import { createChatbotStream } from '#/features/chatbot/chatbot.server';

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response('Unauthorized', { status: 401 });
        }

        try {
          const body = (await request.json()) as {
            messages?: Array<UIMessage | ModelMessage>;
          };

          const abortController = new AbortController();
          request.signal.addEventListener('abort', () => abortController.abort(), { once: true });

          const stream = await createChatbotStream(session.user.id, body.messages ?? []);

          return toServerSentEventsResponse(stream, {
            abortController,
          });
        } catch (error) {
          console.error('Chatbot route error:', error);
          return new Response('Gagal memproses permintaan chatbot.', { status: 500 });
        }
      },
    },
  },
});
