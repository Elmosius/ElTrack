import { useEffect, type MutableRefObject } from 'react';
import { getChatbotErrorMessage } from '#/lib/chatbot';
import { toastManager } from '@/components/selia/toast';

export function useSyncedRefValue<T>(
  ref: MutableRefObject<T>,
  value: T,
) {
  useEffect(() => {
    ref.current = value;
  }, [ref, value]);
}

export function useChatbotErrorToast(
  error: unknown,
  latestErrorRef: MutableRefObject<string | null>,
) {
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
  }, [error, latestErrorRef]);
}
