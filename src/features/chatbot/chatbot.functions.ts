import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '#/lib/auth.server';
import { confirmTransaksiPreviewSchema } from './chatbot.schema';
import { confirmChatbotPreview } from './chatbot.server';

export const confirmChatbotPreviewTransaksi = createServerFn({ method: 'POST' })
  .inputValidator(confirmTransaksiPreviewSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return confirmChatbotPreview(session.user.id, data);
  });
