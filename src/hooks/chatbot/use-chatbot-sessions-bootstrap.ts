import { useEffect } from 'react';
import type { ChatSessionSummary } from '#/types/chatbot';
import { initialMessages } from '@/const/chatbot';
import {
  createChatbotSessionDetail,
  fetchChatbotSessionDetail,
  fetchChatbotSessions,
  type ChatbotSessionHydrator,
} from './use-chatbot-sessions.helpers';

type UseChatbotSessionsBootstrapArgs = {
  userId?: string;
  hydrateSessionDetail: ChatbotSessionHydrator;
  setSessions: React.Dispatch<React.SetStateAction<ChatSessionSummary[]>>;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsBootstrapping: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: (messages: typeof initialMessages) => void;
  setPendingPreview: (preview: null) => void;
};

export function useChatbotSessionsBootstrap({
  userId,
  hydrateSessionDetail,
  setSessions,
  setActiveSessionId,
  setIsBootstrapping,
  setMessages,
  setPendingPreview,
}: UseChatbotSessionsBootstrapArgs) {
  useEffect(() => {
    let isCancelled = false;

    async function bootstrapSessions() {
      if (!userId) {
        setSessions([]);
        setActiveSessionId(null);
        setMessages(initialMessages);
        setPendingPreview(null);
        return;
      }

      setIsBootstrapping(true);

      try {
        const currentSessions = await fetchChatbotSessions();

        if (isCancelled) {
          return;
        }

        if (currentSessions.length === 0) {
          const detail = await createChatbotSessionDetail();

          if (isCancelled) {
            return;
          }

          hydrateSessionDetail(detail, true);
          setSessions([detail.session]);
          return;
        }

        setSessions(currentSessions);
        const detail = await fetchChatbotSessionDetail(currentSessions[0].id);

        if (isCancelled) {
          return;
        }

        hydrateSessionDetail(detail, true);
      } finally {
        if (!isCancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapSessions();

    return () => {
      isCancelled = true;
    };
  }, [
    hydrateSessionDetail,
    setActiveSessionId,
    setIsBootstrapping,
    setMessages,
    setPendingPreview,
    setSessions,
    userId,
  ]);
}
