import { persistChatbotAssistantSessionMessage } from '#/features/chatbot/chatbot.functions';
import {
  getChatbotErrorMessage,
  sanitizeAssistantPreviewResponseMessage,
  toRenderedChatMessages,
  type ChatComposerPayload,
} from '#/lib/chatbot';
import type {
  ChatComposerSectionViewModel,
  ChatMessageListViewModel,
  ChatPanelHeaderViewModel,
} from '#/lib/chatbot/view-models';
import { useUser } from '#/stores/user';
import { toastManager } from '@/components/selia/toast';
import { initialMessages } from '@/const/chatbot';
import { fetchServerSentEvents, type UIMessage, useChat } from '@tanstack/ai-react';
import { useRouter } from '@tanstack/react-router';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useChatbotPreview } from './use-chatbot-preview';
import { useChatbotSessions } from './use-chatbot-sessions';

export function useChatbotPanel() {
  const latestErrorRef = useRef<string | null>(null);
  const latestMessagesRef = useRef<UIMessage[]>(initialMessages);
  const activeSessionIdRef = useRef<string | null>(null);
  const preview = useChatbotPreview({
    getActiveSessionId: () => activeSessionIdRef.current,
    onConfirmSuccess: async (result) => {
      setMessages([...latestMessagesRef.current, result.assistantMessage]);
      sessions.actions.syncSessionSummary(result.session);
      await sessions.actions.refreshSessions();
      await router.invalidate();
    },
    onDismissSuccess: async () => {
      await sessions.actions.refreshSessions();
    },
  });
  const pendingPreviewRef = useRef(preview.state.pendingPreview);
  const router = useRouter();
  const user = useUser();
  const [composerResetVersion, setComposerResetVersion] = useState(0);

  const { messages, sendMessage, setMessages, stop, isLoading, error } =
    useChat({
      connection: fetchServerSentEvents('/api/chat', () => ({
        body: {
          chatSessionId: activeSessionIdRef.current,
        },
      })),
      initialMessages,
      onCustomEvent: preview.actions.handleCustomEvent,
      onFinish: (message) => {
        const chatSessionId = activeSessionIdRef.current;
        const sanitizedMessage = sanitizeAssistantPreviewResponseMessage(
          message as UIMessage,
          pendingPreviewRef.current,
        );

        if (!chatSessionId || message.role !== 'assistant') {
          return;
        }

        const nextMessages = latestMessagesRef.current.map((item) =>
          item.id === message.id ? sanitizedMessage : item,
        );
        latestMessagesRef.current = nextMessages;
        setMessages(nextMessages);

        void persistChatbotAssistantSessionMessage({
          data: {
            chatSessionId,
            message: sanitizedMessage as Extract<UIMessage, { role: 'assistant' }>,
          },
        })
          .then((result: any) => {
            sessions.actions.syncSessionSummary(result.session);
            return sessions.actions.refreshSessions();
          })
          .catch((persistError) => {
            console.error(
              'Persist assistant chat message error:',
              persistError,
            );
          });
      },
    });
  const sessions = useChatbotSessions({
    userId: user?.id,
    setMessages,
    setPendingPreview: preview.actions.setPendingPreview,
  });

  const deferredMessages = useDeferredValue(messages);
  const renderedMessages = useMemo(
    () => toRenderedChatMessages(deferredMessages),
    [deferredMessages],
  );

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    pendingPreviewRef.current = preview.state.pendingPreview;
  }, [preview.state.pendingPreview]);

  useEffect(() => {
    activeSessionIdRef.current = sessions.state.activeSessionId;
  }, [sessions.state.activeSessionId]);

  const resetComposer = useCallback(() => {
    setComposerResetVersion((currentVersion) => currentVersion + 1);
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const sanitizedMessage = getChatbotErrorMessage(error);

    if (latestErrorRef.current === sanitizedMessage) {
      return;
    }

    latestErrorRef.current = sanitizedMessage;

    toastManager.add({
      type: 'error',
      title: 'Chatbot error',
      description: sanitizedMessage,
    });
  }, [error]);

  const handleSend = useCallback(async (payload: ChatComposerPayload) => {
    try {
      let chatSessionId = activeSessionIdRef.current;

      if (!chatSessionId) {
        const detail = await sessions.actions.createSession();
        chatSessionId = detail.session.id;
        activeSessionIdRef.current = detail.session.id;
      }

      if (!chatSessionId) {
        return;
      }

      preview.actions.clearPreview();
      await sendMessage(payload);
      await sessions.actions.refreshSessions();
    } catch (sendError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mengirim pesan',
        description: getChatbotErrorMessage(sendError),
      });
    }
  }, [preview.actions, sendMessage, sessions.actions]);

  const handleClearChat = useCallback(async () => {
    stop();
    resetComposer();
    const detail = await sessions.actions.createSession();
    activeSessionIdRef.current = detail.session.id;
    preview.actions.clearPreview();

    toastManager.add({
      type: 'success',
      title: 'Chat baru',
      description: 'Session percakapan baru sudah dibuat.',
    });
  }, [preview.actions, resetComposer, sessions.actions, stop]);

  const handleConfirmPreview = useCallback(async () => {
    stop();
    await preview.actions.handleConfirmPreview();
  }, [preview.actions, stop]);

  const handleDismissPreview = useCallback(async () => {
    await preview.actions.handleDismissPreview();
  }, [preview.actions]);

  const handleSelectSession = useCallback(async (chatSessionId: string) => {
    stop();
    resetComposer();
    preview.actions.clearPreview();
    const detail = await sessions.actions.selectSession(chatSessionId);
    activeSessionIdRef.current = detail.session.id;
  }, [preview.actions, resetComposer, sessions.actions, stop]);

  const header: ChatPanelHeaderViewModel = useMemo(
    () => ({
      sessions: sessions.state.sessions,
      activeSessionId: sessions.state.activeSessionId,
      isLoading:
        sessions.state.isBootstrapping ||
        sessions.state.isSwitchingSession ||
        isLoading,
      onClearChat: () => void handleClearChat(),
      onSelectSession: (chatSessionId) =>
        void handleSelectSession(chatSessionId),
    }),
    [
      handleClearChat,
      handleSelectSession,
      isLoading,
      sessions.state.activeSessionId,
      sessions.state.isBootstrapping,
      sessions.state.isSwitchingSession,
      sessions.state.sessions,
    ],
  );

  const messageList: ChatMessageListViewModel = useMemo(
    () => ({
      messages: renderedMessages,
      isLoading,
      preview: preview.state.pendingPreview,
      isConfirmingPreview: preview.state.isConfirmingPreview,
      onConfirmPreview: handleConfirmPreview,
      onDismissPreview: handleDismissPreview,
    }),
    [
      handleConfirmPreview,
      handleDismissPreview,
      isLoading,
      preview.state.isConfirmingPreview,
      preview.state.pendingPreview,
      renderedMessages,
    ],
  );

  const composerViewModel: ChatComposerSectionViewModel = useMemo(
    () => ({
      isLoading,
      isDisabled:
        sessions.state.isBootstrapping || sessions.state.isSwitchingSession,
      resetVersion: composerResetVersion,
      onSubmit: handleSend,
    }),
    [
      composerResetVersion,
      handleSend,
      isLoading,
      sessions.state.isBootstrapping,
      sessions.state.isSwitchingSession,
    ],
  );

  return {
    sections: {
      header,
      messageList,
      composer: composerViewModel,
    },
    actions: {
      handleSend,
      handleConfirmPreview,
      handleDismissPreview,
      handleClearChat,
      handleSelectSession,
    },
  };
}
