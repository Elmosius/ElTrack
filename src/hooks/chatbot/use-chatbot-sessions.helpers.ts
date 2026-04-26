import {
  createChatbotSession,
  getChatbotSessionDetail,
  listChatbotSessions,
} from '#/features/chatbot/chatbot.functions';
import type {
  ChatSessionDetail,
  ChatSessionSummary,
  TransaksiPreviewGroup,
} from '#/types/chatbot';
import { initialMessages } from '@/const/chatbot';
import type { UIMessage } from '@tanstack/ai-react';

export type ChatbotSessionHydrator = (
  detail: ChatSessionDetail,
  prioritizeSession?: boolean,
) => ChatSessionDetail;

export type UseChatbotSessionsOptions = {
  userId?: string;
  setMessages: (messages: UIMessage[]) => void;
  setPendingPreview: (preview: TransaksiPreviewGroup | null) => void;
};

export function mergeSessionSummary(
  sessions: ChatSessionSummary[],
  session: ChatSessionSummary,
  prioritize = false,
) {
  const nextSessions = sessions.filter((item) => item.id !== session.id);
  return prioritize ? [session, ...nextSessions] : [...nextSessions, session];
}

export function getDisplayMessages(messages: UIMessage[]) {
  return messages.length > 0 ? messages : initialMessages;
}

export async function fetchChatbotSessions() {
  return listChatbotSessions();
}

export async function fetchChatbotSessionDetail(chatSessionId: string) {
  return (await getChatbotSessionDetail({
    data: { chatSessionId },
  })) as ChatSessionDetail;
}

export async function createChatbotSessionDetail() {
  return (await createChatbotSession()) as ChatSessionDetail;
}
