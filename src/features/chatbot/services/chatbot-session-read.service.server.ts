import type { ChatSessionDetail } from '#/types/chatbot';
import { defaultChatSessionTitle, getPendingPreview } from '../chatbot.shared.server';
import {
  serializeChatMessage,
  serializeChatSession,
  type StoredChatMessage,
} from '../mappers';
import { findChatMessagesBySessionId } from '../repositories/chat-message.repository.server';
import {
  findChatSessionByIdAndUserId,
  findChatSessionListByUserId,
  insertChatSession,
  touchChatSessionByIdAndUserId,
  updateChatSessionPendingPreviewByIdAndUserId,
} from '../repositories/chat-session.repository.server';

export async function getChatSessionOrThrow(
  userId: string,
  chatSessionId: string,
) {
  const session = await findChatSessionByIdAndUserId(userId, chatSessionId);

  if (!session) {
    throw new Error('Session chatbot tidak ditemukan.');
  }

  return session;
}

export async function listChatSessionsService(userId: string) {
  const sessions = await findChatSessionListByUserId(userId);
  return sessions.map((session) => serializeChatSession(session));
}

export async function getChatSessionDetailService(
  userId: string,
  chatSessionId: string,
): Promise<ChatSessionDetail> {
  const session =
    (await touchChatSessionByIdAndUserId(userId, chatSessionId)) ??
    (await getChatSessionOrThrow(userId, chatSessionId));
  const messages = await findChatMessagesBySessionId(userId, chatSessionId);

  return {
    session: serializeChatSession(session.toObject()),
    messages: messages.map((message) =>
      serializeChatMessage(message as StoredChatMessage),
    ),
    pendingPreview: getPendingPreview(session.pendingPreview),
  };
}

export async function createChatSessionService(userId: string) {
  const session = await insertChatSession(userId, defaultChatSessionTitle);

  return {
    session: serializeChatSession(session.toObject()),
    messages: [],
    pendingPreview: null,
  } satisfies ChatSessionDetail;
}

export async function updateChatSessionPendingPreviewService(
  userId: string,
  chatSessionId: string,
  preview: unknown,
) {
  const session = await updateChatSessionPendingPreviewByIdAndUserId(
    userId,
    chatSessionId,
    preview,
  );

  if (!session) {
    throw new Error('Session chatbot tidak ditemukan.');
  }

  return serializeChatSession(session.toObject());
}
