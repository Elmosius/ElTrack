import { auth } from '#/lib/auth.server';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import {
  chatSessionInputSchema,
  confirmTransaksiPreviewSchema,
  dismissTransaksiPreviewSchema,
  persistAssistantChatMessageSchema,
} from './chatbot.schema';
import {
  confirmChatbotPreview,
  createChatSession,
  dismissChatbotPreview,
  getChatSessionDetail,
  listChatSessions,
  persistAssistantChatMessage,
} from './chatbot.server';

async function getUserIdFromRequest() {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user.id;
}

export const listChatbotSessions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await getUserIdFromRequest();
    return (await listChatSessions(userId)) as any;
  },
);

export const getChatbotSessionDetail = createServerFn({ method: 'POST' })
  .inputValidator(chatSessionInputSchema)
  .handler(async ({ data }) => {
    const userId = await getUserIdFromRequest();
    return (await getChatSessionDetail(userId, data.chatSessionId)) as any;
  });

export const createChatbotSession = createServerFn({ method: 'POST' }).handler(
  async () => {
    const userId = await getUserIdFromRequest();
    return (await createChatSession(userId)) as any;
  },
);

export const confirmChatbotPreviewTransaksi = createServerFn({ method: 'POST' })
  .inputValidator(confirmTransaksiPreviewSchema)
  .handler(async ({ data }) => {
    const userId = await getUserIdFromRequest();
    return (await confirmChatbotPreview(userId, data)) as any;
  });

export const dismissChatbotPreviewSession = createServerFn({ method: 'POST' })
  .inputValidator(dismissTransaksiPreviewSchema)
  .handler(async ({ data }) => {
    const userId = await getUserIdFromRequest();
    return (await dismissChatbotPreview(userId, data.chatSessionId)) as any;
  });

export const persistChatbotAssistantSessionMessage = createServerFn({
  method: 'POST',
})
  .inputValidator(persistAssistantChatMessageSchema)
  .handler(async ({ data }) => {
    const userId = await getUserIdFromRequest();
    return (await persistAssistantChatMessage(userId, data)) as any;
  });
