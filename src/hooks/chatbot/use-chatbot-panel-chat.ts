import {
  sanitizeAssistantPreviewResponseMessage,
  toRenderedChatMessages,
} from '#/lib/chatbot';
import type { TransaksiPreviewGroup } from '#/types/chatbot';
import { initialMessages } from '@/const/chatbot';
import {
  fetchServerSentEvents,
  type UIMessage,
  useChat,
} from '@tanstack/ai-react';
import { useDeferredValue, useMemo, useRef, type MutableRefObject } from 'react';
import { useSyncedRefValue } from './use-chatbot-panel-effects';

type PersistAssistantMessageArgs = {
  chatSessionId: string;
  assistantMessage: Extract<UIMessage, { role: 'assistant' }>;
};

type UseChatbotPanelChatArgs = {
  activeSessionIdRef: MutableRefObject<string | null>;
  pendingPreviewRef: MutableRefObject<TransaksiPreviewGroup | null>;
  onCustomEvent: (eventType: string, value: unknown) => void;
  onPersistAssistantMessage: (args: PersistAssistantMessageArgs) => void;
};

export function useChatbotPanelChat({
  activeSessionIdRef,
  pendingPreviewRef,
  onCustomEvent,
  onPersistAssistantMessage,
}: UseChatbotPanelChatArgs) {
  const latestMessagesRef = useRef<UIMessage[]>(initialMessages);
  const { messages, sendMessage, setMessages, stop, isLoading, error } = useChat({
    connection: fetchServerSentEvents('/api/chat', () => ({
      body: {
        chatSessionId: activeSessionIdRef.current,
      },
    })),
    initialMessages,
    onCustomEvent,
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

      onPersistAssistantMessage({
        chatSessionId,
        assistantMessage: sanitizedMessage as Extract<UIMessage, { role: 'assistant' }>,
      });
    },
  });

  const deferredMessages = useDeferredValue(messages);
  const renderedMessages = useMemo(
    () => toRenderedChatMessages(deferredMessages),
    [deferredMessages],
  );

  useSyncedRefValue(latestMessagesRef, messages);

  return {
    messages,
    latestMessagesRef,
    renderedMessages,
    sendMessage,
    setMessages,
    stop,
    isLoading,
    error,
  };
}

export type { PersistAssistantMessageArgs };
