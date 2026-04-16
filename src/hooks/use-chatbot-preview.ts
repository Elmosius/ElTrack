import {
  confirmChatbotPreviewTransaksi,
  dismissChatbotPreviewSession,
} from '#/features/chatbot/chatbot.functions';
import {
  chatbotPreviewEventName,
  isMeaningfulPreviewItem,
  transaksiPreviewGroupSchema,
  type ConfirmChatbotPreviewResult,
  type TransaksiPreviewGroup,
} from '#/features/chatbot/chatbot.schema';
import { getErrorMessage } from '#/lib/chatbot';
import { toastManager } from '@/components/selia/toast';
import { useState } from 'react';

type UseChatbotPreviewOptions = {
  getActiveSessionId: () => string | null;
  onConfirmSuccess?: (
    result: ConfirmChatbotPreviewResult,
  ) => Promise<void> | void;
  onDismissSuccess?: () => Promise<void> | void;
};

export function useChatbotPreview({
  getActiveSessionId,
  onConfirmSuccess,
  onDismissSuccess,
}: UseChatbotPreviewOptions) {
  const [pendingPreview, setPendingPreview] = useState<TransaksiPreviewGroup | null>(
    null,
  );
  const [isConfirmingPreview, setIsConfirmingPreview] = useState(false);

  const handleCustomEvent = (eventType: string, value: unknown) => {
    if (eventType !== chatbotPreviewEventName) {
      return;
    }

    const preview = transaksiPreviewGroupSchema.safeParse(value);

    if (!preview.success) {
      return;
    }

    const meaningfulItems = preview.data.items.filter((item) =>
      isMeaningfulPreviewItem(item),
    );

    if (meaningfulItems.length === 0) {
      return;
    }

    setPendingPreview({
      ...preview.data,
      items: meaningfulItems,
    });
  };

  const handleConfirmPreview = async () => {
    const chatSessionId = getActiveSessionId();

    if (
      !chatSessionId ||
      !pendingPreview ||
      !pendingPreview.canConfirm ||
      isConfirmingPreview
    ) {
      return;
    }

    try {
      setIsConfirmingPreview(true);

      const result = await confirmChatbotPreviewTransaksi({
        data: { chatSessionId },
      }) as ConfirmChatbotPreviewResult;

      setPendingPreview(null);
      await onConfirmSuccess?.(result);
      toastManager.add({
        type: 'success',
        title: 'Berhasil',
        description: 'Transaksi baru sudah ditambahkan.',
      });
    } catch (confirmError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menyimpan transaksi',
        description: getErrorMessage(confirmError),
      });
    } finally {
      setIsConfirmingPreview(false);
    }
  };

  const handleDismissPreview = async () => {
    const chatSessionId = getActiveSessionId();
    setPendingPreview(null);

    if (!chatSessionId) {
      return;
    }

    try {
      await dismissChatbotPreviewSession({
        data: { chatSessionId },
      });
      await onDismissSuccess?.();
    } catch (dismissError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal membatalkan preview',
        description: getErrorMessage(dismissError),
      });
    }
  };

  return {
    state: {
      pendingPreview,
      isConfirmingPreview,
    },
    actions: {
      handleCustomEvent,
      handleConfirmPreview,
      handleDismissPreview,
      clearPreview() {
        setPendingPreview(null);
      },
      setPendingPreview,
    },
  };
}
