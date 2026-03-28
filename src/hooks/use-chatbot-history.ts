import { getChatHistoryStorageKey, parseStoredMessages, serializeMessagesForHistory } from '#/lib/chatbot';
import type { UIMessage } from '@tanstack/ai-react';
import { useEffect, useRef } from 'react';

type UseChatbotHistoryOptions = {
  userId?: string;
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
  initialMessages: UIMessage[];
};

export function useChatbotHistory({ userId, messages, setMessages, initialMessages }: UseChatbotHistoryOptions) {
  const hydratedHistoryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!userId) {
      hydratedHistoryKeyRef.current = null;
      return;
    }

    if (hydratedHistoryKeyRef.current === userId) {
      return;
    }

    const storedMessages = parseStoredMessages(window.localStorage.getItem(getChatHistoryStorageKey(userId)));

    setMessages(storedMessages && storedMessages.length > 0 ? storedMessages : initialMessages);
    hydratedHistoryKeyRef.current = userId;
  }, [initialMessages, setMessages, userId]);

  useEffect(() => {
    if (!userId || hydratedHistoryKeyRef.current !== userId || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(getChatHistoryStorageKey(userId), JSON.stringify(serializeMessagesForHistory(messages)));
  }, [messages, userId]);

  const clearHistory = () => {
    if (typeof window === 'undefined' || !userId) {
      return;
    }

    window.localStorage.removeItem(getChatHistoryStorageKey(userId));
  };

  return {
    actions: {
      clearHistory,
    },
  };
}
