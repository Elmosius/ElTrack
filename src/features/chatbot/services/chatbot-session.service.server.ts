import type { ModelMessage, UIMessage } from '@tanstack/ai';
import {
  createChatSessionTitle,
  extractMessageText,
  sanitizeMessageForStorage,
} from '#/lib/chatbot';
import type {
  PersistAssistantChatMessageInput,
} from '../chatbot.schema';
import type { ChatSessionDetail } from '#/types/chatbot';
import { defaultChatSessionTitle, getPendingPreview } from '../chatbot.shared.server';
import {
  serializeChatMessage,
  serializeChatSession,
  type StoredChatMessage,
} from '../mappers';
import {
  findChatMessagesBySessionId,
  upsertChatMessageBySessionId,
} from '../repositories/chat-message.repository.server';
import {
  findChatSessionByIdAndUserId,
  findChatSessionListByUserId,
  insertChatSession,
  touchChatSessionByIdAndUserId,
  updateChatSessionActivityByIdAndUserId,
  updateChatSessionPendingPreviewByIdAndUserId,
  updateChatSessionTitleIfDefault,
} from '../repositories/chat-session.repository.server';

function getLastUserMessage(messages: Array<UIMessage | ModelMessage>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message && 'parts' in message && message.role === 'user') {
      return message;
    }
  }

  return null;
}

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

export async function storeChatMessageForSession(
  userId: string,
  chatSessionId: string,
  message: UIMessage,
) {
  await getChatSessionOrThrow(userId, chatSessionId);

  const storedMessage = sanitizeMessageForStorage(message);
  await upsertChatMessageBySessionId(userId, chatSessionId, storedMessage);

  if (storedMessage.role === 'user') {
    const title = createChatSessionTitle(extractMessageText(storedMessage));
    await updateChatSessionTitleIfDefault(userId, chatSessionId, title);
  }

  await updateChatSessionActivityByIdAndUserId(userId, chatSessionId);

  return storedMessage;
}

export async function persistChatUserMessageService(
  userId: string,
  chatSessionId: string,
  messages: Array<UIMessage | ModelMessage>,
) {
  const session = await getChatSessionOrThrow(userId, chatSessionId);
  const latestUserMessage = getLastUserMessage(messages);

  if (!latestUserMessage) {
    return {
      session: serializeChatSession(session.toObject()),
    };
  }

  await storeChatMessageForSession(userId, chatSessionId, latestUserMessage);
  const updatedSession = await getChatSessionOrThrow(userId, chatSessionId);

  return {
    session: serializeChatSession(updatedSession.toObject()),
  };
}

export async function persistAssistantChatMessageService(
  userId: string,
  input: PersistAssistantChatMessageInput,
) {
  const { chatSessionId, message } = input;
  const storedMessage = await storeChatMessageForSession(
    userId,
    chatSessionId,
    message as unknown as UIMessage,
  );
  const updatedSession = await getChatSessionOrThrow(userId, chatSessionId);

  return {
    assistantMessage: storedMessage,
    session: serializeChatSession(updatedSession.toObject()),
  };
}
