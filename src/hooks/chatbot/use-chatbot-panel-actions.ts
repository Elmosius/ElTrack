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
  activeRequestIdRef: MutableRefObject<string | null>;
  previewActions: ChatbotPanelPreviewActions;
  sessionsActions: ChatbotPanelSessionsActions;
  sendMessage: (payload: ChatComposerPayload) => Promise<unknown>;
  stop: () => void;
  resetComposer: () => void;
};

function createChatbotRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChatbotPanelActions({
  activeSessionIdRef,
  activeRequestIdRef,
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

        activeRequestIdRef.current = createChatbotRequestId();
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
    [
      activeRequestIdRef,
      activeSessionIdRef,
      previewActions,
      sendMessage,
      sessionsActions,
    ],
  );

  const handleClearChat = useCallback(async () => {
    stop();
    resetComposer();
    activeRequestIdRef.current = null;
    const detail = await sessionsActions.createSession();
    activeSessionIdRef.current = detail.session.id;
    previewActions.clearPreview();

    toastManager.add({
      type: 'success',
      title: 'Chat baru',
      description: 'Session percakapan baru sudah dibuat.',
    });
  }, [
    activeRequestIdRef,
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
    stop();
    await previewActions.handleDismissPreview();
  }, [previewActions, stop]);

  const handleSelectSession = useCallback(
    async (chatSessionId: string) => {
      stop();
      resetComposer();
      activeRequestIdRef.current = null;
      previewActions.clearPreview();
      const detail = await sessionsActions.selectSession(chatSessionId);
      activeSessionIdRef.current = detail.session.id;
    },
    [
      activeRequestIdRef,
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
