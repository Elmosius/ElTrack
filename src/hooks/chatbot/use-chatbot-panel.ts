import { persistChatbotAssistantSessionMessage } from '#/features/chatbot/chatbot.functions';
import type { ConfirmChatbotPreviewResult } from '#/types/chatbot';
import { useUser } from '#/stores/user';
import { useRouter } from '@tanstack/react-router';
import { useCallback, useRef, useState } from 'react';
import { useChatbotPanelActions } from './use-chatbot-panel-actions';
import {
  useChatbotPanelChat,
  type PersistAssistantMessageArgs,
} from './use-chatbot-panel-chat';
import {
  useChatbotErrorToast,
  useSyncedRefValue,
} from './use-chatbot-panel-effects';
import { useChatbotPanelSections } from './use-chatbot-panel-sections';
import { useChatbotPreview } from './use-chatbot-preview';
import { useChatbotSessions } from './use-chatbot-sessions';

export function useChatbotPanel() {
  const latestErrorRef = useRef<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const persistAssistantMessageRef = useRef(
    (_args: PersistAssistantMessageArgs) => {},
  );
  const handlePreviewConfirmSuccessRef = useRef(
    async (_result: ConfirmChatbotPreviewResult) => {},
  );
  const handlePreviewDismissSuccessRef = useRef(async () => {});
  const preview = useChatbotPreview({
    getActiveSessionId: () => activeSessionIdRef.current,
    onConfirmSuccess: (result) => handlePreviewConfirmSuccessRef.current(result),
    onDismissSuccess: () => handlePreviewDismissSuccessRef.current(),
  });
  const pendingPreviewRef = useRef(preview.state.pendingPreview);
  const router = useRouter();
  const user = useUser();
  const [composerResetVersion, setComposerResetVersion] = useState(0);

  const chat = useChatbotPanelChat({
    activeSessionIdRef,
    pendingPreviewRef,
    onCustomEvent: preview.actions.handleCustomEvent,
    onPersistAssistantMessage: (args) => persistAssistantMessageRef.current(args),
  });
  const sessions = useChatbotSessions({
    userId: user?.id,
    setMessages: chat.setMessages,
    setPendingPreview: preview.actions.setPendingPreview,
  });
  useSyncedRefValue(pendingPreviewRef, preview.state.pendingPreview);
  useSyncedRefValue(activeSessionIdRef, sessions.state.activeSessionId);
  useSyncedRefValue(
    persistAssistantMessageRef,
    ({ chatSessionId, assistantMessage }: PersistAssistantMessageArgs) => {
      void persistChatbotAssistantSessionMessage({
        data: {
          chatSessionId,
          message: assistantMessage,
        },
      })
        .then((result: any) => {
          sessions.actions.syncSessionSummary(result.session);
          return sessions.actions.refreshSessions();
        })
        .catch((persistError) => {
          console.error('Persist assistant chat message error:', persistError);
        });
    },
  );
  useSyncedRefValue(
    handlePreviewConfirmSuccessRef,
    async (result: ConfirmChatbotPreviewResult) => {
      chat.setMessages([...chat.latestMessagesRef.current, result.assistantMessage]);
      sessions.actions.syncSessionSummary(result.session);
      await sessions.actions.refreshSessions();
      await router.invalidate();
    },
  );
  useSyncedRefValue(handlePreviewDismissSuccessRef, async () => {
    await sessions.actions.refreshSessions();
  });

  const resetComposer = useCallback(() => {
    setComposerResetVersion((currentVersion) => currentVersion + 1);
  }, []);

  useChatbotErrorToast(chat.error, latestErrorRef);

  const {
    handleSend,
    handleClearChat,
    handleConfirmPreview,
    handleDismissPreview,
    handleSelectSession,
  } = useChatbotPanelActions({
    activeSessionIdRef,
    previewActions: preview.actions,
    sessionsActions: sessions.actions,
    sendMessage: chat.sendMessage,
    stop: chat.stop,
    resetComposer,
  });

  const sections = useChatbotPanelSections({
    sessions: sessions.state.sessions,
    activeSessionId: sessions.state.activeSessionId,
    isBootstrapping: sessions.state.isBootstrapping,
    isSwitchingSession: sessions.state.isSwitchingSession,
    isLoading: chat.isLoading,
    renderedMessages: chat.renderedMessages,
    pendingPreview: preview.state.pendingPreview,
    isConfirmingPreview: preview.state.isConfirmingPreview,
    composerResetVersion,
    handleSend,
    handleClearChat,
    handleSelectSession,
    handleConfirmPreview,
    handleDismissPreview,
  });

  return {
    sections,
    actions: {
      handleSend,
      handleConfirmPreview,
      handleDismissPreview,
      handleClearChat,
      handleSelectSession,
    },
  };
}
