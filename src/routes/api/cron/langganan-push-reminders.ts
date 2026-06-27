import { authorizeLanggananReminderCron } from '#/features/langganan/services/langganan-cron-auth.server';
import { runLanggananPushReminderJob } from '#/features/langganan/services/langganan-push.service.server';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/cron/langganan-push-reminders')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = authorizeLanggananReminderCron(request);

        if (!auth.ok) {
          return Response.json(
            { error: auth.message },
            { status: auth.status },
          );
        }

        try {
          const result = await runLanggananPushReminderJob();
          return Response.json(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';

          return Response.json(
            {
              error: 'Gagal mengirim push reminder Langganan.',
              message,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
