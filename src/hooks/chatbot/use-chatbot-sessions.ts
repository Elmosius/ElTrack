import type {
  ChatSessionDetail,
  ChatSessionSummary,
} from '#/types/chatbot';
import { useCallback, useState } from 'react';
import { useChatbotSessionsActions } from './use-chatbot-sessions-actions';
import { useChatbotSessionsBootstrap } from './use-chatbot-sessions-bootstrap';
import {
  getDisplayMessages,
  mergeSessionSummary,
  type UseChatbotSessionsOptions,
} from './use-chatbot-sessions.helpers';

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

  const {
    refreshSessions,
    selectSession,
    createSession,
    syncSessionSummary,
  } = useChatbotSessionsActions({
    userId,
    hydrateSessionDetail,
    setSessions,
    setIsSwitchingSession,
  });

  useChatbotSessionsBootstrap({
    userId,
    hydrateSessionDetail,
    setSessions,
    setActiveSessionId,
    setIsBootstrapping,
    setMessages,
    setPendingPreview,
  });

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
