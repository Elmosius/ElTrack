import type { ModelMessage, UIMessage } from '@tanstack/ai';
import {
  createChatSessionTitle,
  extractMessageText,
  sanitizeMessageForStorage,
} from '#/lib/chatbot';
import type { PersistAssistantChatMessageInput } from '../chatbot.schema';
import { serializeChatSession } from '../mappers';
import { upsertChatMessageBySessionId } from '../repositories/chat-message.repository.server';
import {
  updateChatSessionActivityByIdAndUserId,
  updateChatSessionTitleIfDefault,
} from '../repositories/chat-session.repository.server';
import { getChatSessionOrThrow } from './chatbot-session-read.service.server';

function getLastUserMessage(messages: Array<UIMessage | ModelMessage>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message && 'parts' in message && message.role === 'user') {
      return message;
    }
  }

  return null;
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
