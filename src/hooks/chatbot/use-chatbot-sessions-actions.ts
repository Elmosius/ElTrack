import type { ChatSessionSummary } from '#/types/chatbot';
import { useCallback } from 'react';
import {
  createChatbotSessionDetail,
  fetchChatbotSessionDetail,
  fetchChatbotSessions,
  mergeSessionSummary,
  type ChatbotSessionHydrator,
} from './use-chatbot-sessions.helpers';

type UseChatbotSessionsActionsArgs = {
  userId?: string;
  hydrateSessionDetail: ChatbotSessionHydrator;
  setSessions: React.Dispatch<React.SetStateAction<ChatSessionSummary[]>>;
  setIsSwitchingSession: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useChatbotSessionsActions({
  userId,
  hydrateSessionDetail,
  setSessions,
  setIsSwitchingSession,
}: UseChatbotSessionsActionsArgs) {
  const refreshSessions = useCallback(async () => {
    if (!userId) {
      return [];
    }

    const nextSessions = await fetchChatbotSessions();
    setSessions(nextSessions);
    return nextSessions;
  }, [setSessions, userId]);

  const selectSession = useCallback(
    async (chatSessionId: string) => {
      setIsSwitchingSession(true);

      try {
        const detail = await fetchChatbotSessionDetail(chatSessionId);
        return hydrateSessionDetail(detail, true);
      } finally {
        setIsSwitchingSession(false);
      }
    },
    [hydrateSessionDetail, setIsSwitchingSession],
  );

  const createSession = useCallback(async () => {
    setIsSwitchingSession(true);

    try {
      const detail = await createChatbotSessionDetail();
      return hydrateSessionDetail(detail, true);
    } finally {
      setIsSwitchingSession(false);
    }
  }, [hydrateSessionDetail, setIsSwitchingSession]);

  const syncSessionSummary = useCallback(
    (session: ChatSessionSummary) => {
      setSessions((currentSessions) =>
        mergeSessionSummary(currentSessions, session, true),
      );
    },
    [setSessions],
  );

  return {
    refreshSessions,
    selectSession,
    createSession,
    syncSessionSummary,
  };
}
