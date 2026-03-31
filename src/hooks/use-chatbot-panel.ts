import { persistChatbotAssistantSessionMessage } from '#/features/chatbot/chatbot.functions';
import { getErrorMessage, toRenderedChatMessages } from '#/lib/chatbot';
import type {
  ChatComposerViewModel,
  ChatMessageListViewModel,
  ChatPanelHeaderViewModel,
} from '#/lib/chatbot/view-models';
import { useUser } from '#/stores/user';
import { toastManager } from '@/components/selia/toast';
import { initialMessages } from '@/const/chatbot';
import { fetchServerSentEvents, type UIMessage, useChat } from '@tanstack/ai-react';
import { useRouter } from '@tanstack/react-router';
import { useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { useChatbotComposer } from './use-chatbot-composer';
import { useChatbotPreview } from './use-chatbot-preview';
import { useChatbotSessions } from './use-chatbot-sessions';

export function useChatbotPanel() {
  const latestErrorRef = useRef<string | null>(null);
  const latestMessagesRef = useRef<UIMessage[]>(initialMessages);
  const activeSessionIdRef = useRef<string | null>(null);
  const router = useRouter();
  const user = useUser();
  const composer = useChatbotComposer();
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

        if (!chatSessionId || message.role !== 'assistant') {
          return;
        }

        void persistChatbotAssistantSessionMessage({
          data: {
            chatSessionId,
            message: message as Extract<UIMessage, { role: 'assistant' }>,
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
    activeSessionIdRef.current = sessions.state.activeSessionId;
  }, [sessions.state.activeSessionId]);

  useEffect(() => {
    if (!error || latestErrorRef.current === error.message) {
      return;
    }

    latestErrorRef.current = error.message;

    toastManager.add({
      type: 'error',
      title: 'Chatbot error',
      description: error.message,
    });
  }, [error]);

  const handleSend = async () => {
    try {
      let chatSessionId = activeSessionIdRef.current;

      if (!chatSessionId) {
        const detail = await sessions.actions.createSession();
        chatSessionId = detail.session.id;
        activeSessionIdRef.current = detail.session.id;
      }

      const payload = await composer.actions.buildMessagePayload();

      if (!payload || !chatSessionId) {
        return;
      }

      preview.actions.clearPreview();
      composer.actions.resetComposer();
      await sendMessage(payload);
      await sessions.actions.refreshSessions();
    } catch (sendError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mengirim pesan',
        description: getErrorMessage(sendError),
      });
    }
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSend();
  };

  const handleClearChat = async () => {
    stop();
    composer.actions.resetComposer();
    const detail = await sessions.actions.createSession();
    activeSessionIdRef.current = detail.session.id;
    preview.actions.clearPreview();

    toastManager.add({
      type: 'success',
      title: 'Chat baru',
      description: 'Session percakapan baru sudah dibuat.',
    });
  };

  const handleConfirmPreview = async () => {
    stop();
    await preview.actions.handleConfirmPreview();
  };

  const handleDismissPreview = async () => {
    await preview.actions.handleDismissPreview();
  };

  const handleSelectSession = async (chatSessionId: string) => {
    stop();
    composer.actions.resetComposer();
    preview.actions.clearPreview();
    const detail = await sessions.actions.selectSession(chatSessionId);
    activeSessionIdRef.current = detail.session.id;
  };

  const header: ChatPanelHeaderViewModel = {
    sessions: sessions.state.sessions,
    activeSessionId: sessions.state.activeSessionId,
    isLoading:
      sessions.state.isBootstrapping ||
      sessions.state.isSwitchingSession ||
      isLoading,
    onClearChat: () => void handleClearChat(),
    onSelectSession: (chatSessionId) => void handleSelectSession(chatSessionId),
  };

  const messageList: ChatMessageListViewModel = {
    messages: renderedMessages,
    isLoading,
    preview: preview.state.pendingPreview,
    isConfirmingPreview: preview.state.isConfirmingPreview,
    onConfirmPreview: handleConfirmPreview,
    onDismissPreview: handleDismissPreview,
  };

  const composerViewModel: ChatComposerViewModel = {
    draft: composer.state.draft,
    attachmentName: composer.state.attachmentName,
    isLoading,
    isDisabled:
      sessions.state.isBootstrapping || sessions.state.isSwitchingSession,
    textareaRef: composer.refs.textareaRef,
    fileInputRef: composer.refs.fileInputRef,
    onDraftChange: composer.actions.setDraft,
    onComposerKeyDown: handleComposerKeyDown,
    onAttachmentSelect: composer.actions.handleAttachmentSelect,
    onAttachmentClick: composer.actions.handleAttachmentClick,
    onSend: () => void handleSend(),
  };

  return {
    sections: {
      header,
      messageList,
      composer: composerViewModel,
    },
    actions: {
      handleSend,
      handleComposerKeyDown,
      handleConfirmPreview,
      handleDismissPreview,
      handleClearChat,
      handleSelectSession,
    },
  };
}
