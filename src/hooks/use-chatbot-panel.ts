import { createAssistantMessage, getErrorMessage, toRenderedChatMessages } from '#/lib/chatbot';
import { useUser } from '#/stores/user';
import { toastManager } from '@/components/selia/toast';
import { initialMessages } from '@/const/chatbot';
import { fetchServerSentEvents, type UIMessage, useChat } from '@tanstack/ai-react';
import { useRouter } from '@tanstack/react-router';
import { useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { useChatbotComposer } from './use-chatbot-composer';
import { useChatbotHistory } from './use-chatbot-history';
import { useChatbotPreview } from './use-chatbot-preview';

export function useChatbotPanel() {
  const latestErrorRef = useRef<string | null>(null);
  const latestMessagesRef = useRef<UIMessage[]>(initialMessages);
  const router = useRouter();
  const user = useUser();
  const composer = useChatbotComposer();
  const preview = useChatbotPreview({
    onConfirmSuccess: async () => {
      setMessages([...latestMessagesRef.current, createAssistantMessage('Transaksi berhasil disimpan ke tabel.')]);
      await router.invalidate();
    },
  });

  const { messages, sendMessage, setMessages, stop, isLoading, error } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    initialMessages,
    onCustomEvent: preview.actions.handleCustomEvent,
  });
  const history = useChatbotHistory({
    userId: user?.id,
    messages,
    setMessages,
    initialMessages,
  });

  const deferredMessages = useDeferredValue(messages);
  const renderedMessages = useMemo(() => toRenderedChatMessages(deferredMessages), [deferredMessages]);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

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
      const payload = await composer.actions.buildMessagePayload();

      if (!payload) {
        return;
      }

      preview.actions.clearPreview();
      composer.actions.resetComposer();
      await sendMessage(payload);
    } catch (sendError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mengirim pesan',
        description: getErrorMessage(sendError),
      });
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSend();
  };

  const handleClearChat = () => {
    stop();
    preview.actions.clearPreview();
    composer.actions.resetComposer();
    setMessages(initialMessages);
    history.actions.clearHistory();

    toastManager.add({
      type: 'success',
      title: 'Chat baru',
      description: 'Riwayat percakapan berhasil direset.',
    });
  };

  const handleConfirmPreview = async () => {
    stop();
    await preview.actions.handleConfirmPreview();
  };

  return {
    state: {
      draft: composer.state.draft,
      attachmentName: composer.state.attachmentName,
      pendingPreview: preview.state.pendingPreview,
      isConfirmingPreview: preview.state.isConfirmingPreview,
      isLoading,
    },
    derived: {
      renderedMessages,
    },
    actions: {
      setDraft: composer.actions.setDraft,
      handleSend,
      handleComposerKeyDown,
      handleAttachmentSelect: composer.actions.handleAttachmentSelect,
      handleAttachmentClick: composer.actions.handleAttachmentClick,
      handleConfirmPreview,
      handleDismissPreview: preview.actions.handleDismissPreview,
      handleClearChat,
    },
    refs: {
      textareaRef: composer.refs.textareaRef,
      fileInputRef: composer.refs.fileInputRef,
    },
  };
}
