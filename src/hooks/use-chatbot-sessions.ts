import type { UIMessage } from '@tanstack/ai-react';
import type {
  ChatSessionDetail,
  ChatSessionSummary,
  TransaksiPreviewGroup,
} from '#/features/chatbot/chatbot.schema';
import {
  createChatbotSession,
  getChatbotSessionDetail,
  listChatbotSessions,
} from '#/features/chatbot/chatbot.functions';
import { initialMessages } from '@/const/chatbot';
import { useCallback, useEffect, useState } from 'react';

type UseChatbotSessionsOptions = {
  userId?: string;
  setMessages: (messages: UIMessage[]) => void;
  setPendingPreview: (preview: TransaksiPreviewGroup | null) => void;
};

function mergeSessionSummary(
  sessions: ChatSessionSummary[],
  session: ChatSessionSummary,
  prioritize = false,
) {
  const nextSessions = sessions.filter((item) => item.id !== session.id);
  return prioritize ? [session, ...nextSessions] : [...nextSessions, session];
}

function getDisplayMessages(messages: UIMessage[]) {
  return messages.length > 0 ? messages : initialMessages;
}

export function useChatbotSessions({
  userId,
  setMessages,
  setPendingPreview,
}: UseChatbotSessionsOptions) {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isSwitchingSession, setIsSwitchingSession] = useState(false);

  const hydrateSessionDetail = useCallback(
    (detail: ChatSessionDetail, prioritizeSession = true) => {
      setActiveSessionId(detail.session.id);
      setSessions((currentSessions) =>
        mergeSessionSummary(currentSessions, detail.session, prioritizeSession),
      );
      setMessages(getDisplayMessages(detail.messages));
      setPendingPreview(detail.pendingPreview);
      return detail;
    },
    [setMessages, setPendingPreview],
  );

  const refreshSessions = useCallback(async () => {
    if (!userId) {
      return [];
    }

    const nextSessions = await listChatbotSessions();
    setSessions(nextSessions);
    return nextSessions;
  }, [userId]);

  const selectSession = useCallback(
    async (chatSessionId: string) => {
      setIsSwitchingSession(true);

      try {
        const detail = (await getChatbotSessionDetail({
          data: { chatSessionId },
        })) as ChatSessionDetail;

        return hydrateSessionDetail(detail, true);
      } finally {
        setIsSwitchingSession(false);
      }
    },
    [hydrateSessionDetail],
  );

  const createSession = useCallback(async () => {
    setIsSwitchingSession(true);

    try {
      const detail = (await createChatbotSession()) as ChatSessionDetail;
      return hydrateSessionDetail(detail, true);
    } finally {
      setIsSwitchingSession(false);
    }
  }, [hydrateSessionDetail]);

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
        const currentSessions = await listChatbotSessions();

        if (isCancelled) {
          return;
        }

        if (currentSessions.length === 0) {
          const detail = (await createChatbotSession()) as ChatSessionDetail;

          if (isCancelled) {
            return;
          }

          hydrateSessionDetail(detail, true);
          setSessions([detail.session]);
          return;
        }

        setSessions(currentSessions);
        const detail = (await getChatbotSessionDetail({
          data: { chatSessionId: currentSessions[0].id },
        })) as ChatSessionDetail;

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
  }, [hydrateSessionDetail, setMessages, setPendingPreview, userId]);

  const syncSessionSummary = useCallback((session: ChatSessionSummary) => {
    setSessions((currentSessions) =>
      mergeSessionSummary(currentSessions, session, true),
    );
  }, []);

  return {
    state: {
      sessions,
      activeSessionId,
      isBootstrapping,
      isSwitchingSession,
    },
    actions: {
      createSession,
      selectSession,
      refreshSessions,
      syncSessionSummary,
    },
  };
}
