import { useCallback, type MutableRefObject } from 'react';
import { getChatbotErrorMessage, type ChatComposerPayload } from '#/lib/chatbot';
import { toastManager } from '@/components/selia/toast';

type ChatbotPanelPreviewActions = {
  clearPreview: () => void;
  handleConfirmPreview: () => Promise<void>;
  handleDismissPreview: () => Promise<void>;
};

type ChatbotPanelSessionsActions = {
  createSession: () => Promise<{ session: { id: string } }>;
  refreshSessions: () => Promise<unknown>;
  selectSession: (chatSessionId: string) => Promise<{ session: { id: string } }>;
};

type UseChatbotPanelActionsArgs = {
  activeSessionIdRef: MutableRefObject<string | null>;
  previewActions: ChatbotPanelPreviewActions;
  sessionsActions: ChatbotPanelSessionsActions;
  sendMessage: (payload: ChatComposerPayload) => Promise<unknown>;
  stop: () => void;
  resetComposer: () => void;
};

export function useChatbotPanelActions({
  activeSessionIdRef,
  previewActions,
  sessionsActions,
  sendMessage,
  stop,
  resetComposer,
}: UseChatbotPanelActionsArgs) {
  const handleSend = useCallback(
    async (payload: ChatComposerPayload) => {
      try {
        let chatSessionId = activeSessionIdRef.current;

        if (!chatSessionId) {
          const detail = await sessionsActions.createSession();
          chatSessionId = detail.session.id;
          activeSessionIdRef.current = detail.session.id;
        }

        if (!chatSessionId) {
          return;
        }

        previewActions.clearPreview();
        await sendMessage(payload);
        await sessionsActions.refreshSessions();
      } catch (sendError) {
        toastManager.add({
          type: 'error',
          title: 'Gagal mengirim pesan',
          description: getChatbotErrorMessage(sendError),
        });
      }
    },
    [activeSessionIdRef, previewActions, sendMessage, sessionsActions],
  );

  const handleClearChat = useCallback(async () => {
    stop();
    resetComposer();
    const detail = await sessionsActions.createSession();
    activeSessionIdRef.current = detail.session.id;
    previewActions.clearPreview();

    toastManager.add({
      type: 'success',
      title: 'Chat baru',
      description: 'Session percakapan baru sudah dibuat.',
    });
  }, [
    activeSessionIdRef,
    previewActions,
    resetComposer,
    sessionsActions,
    stop,
  ]);

  const handleConfirmPreview = useCallback(async () => {
    stop();
    await previewActions.handleConfirmPreview();
  }, [previewActions, stop]);

  const handleDismissPreview = useCallback(async () => {
    await previewActions.handleDismissPreview();
  }, [previewActions]);

  const handleSelectSession = useCallback(
    async (chatSessionId: string) => {
      stop();
      resetComposer();
      previewActions.clearPreview();
      const detail = await sessionsActions.selectSession(chatSessionId);
      activeSessionIdRef.current = detail.session.id;
    },
    [
      activeSessionIdRef,
      previewActions,
      resetComposer,
      sessionsActions,
      stop,
    ],
  );

  return {
    handleSend,
    handleClearChat,
    handleConfirmPreview,
    handleDismissPreview,
    handleSelectSession,
  };
}
