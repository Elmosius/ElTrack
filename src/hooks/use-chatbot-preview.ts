import { confirmChatbotPreviewTransaksi } from '#/features/chatbot/chatbot.functions';
import {
  chatbotPreviewEventName,
  transaksiPreviewSchema,
  type TransaksiPreview,
} from '#/features/chatbot/chatbot.schema';
import { getErrorMessage } from '#/lib/chatbot';
import { toastManager } from '@/components/selia/toast';
import { useState } from 'react';

type UseChatbotPreviewOptions = {
  onConfirmSuccess?: () => Promise<void> | void;
};

export function useChatbotPreview({
  onConfirmSuccess,
}: UseChatbotPreviewOptions = {}) {
  const [pendingPreview, setPendingPreview] = useState<TransaksiPreview | null>(
    null,
  );
  const [isConfirmingPreview, setIsConfirmingPreview] = useState(false);

  const handleCustomEvent = (eventType: string, value: unknown) => {
    if (eventType !== chatbotPreviewEventName) {
      return;
    }

    const preview = transaksiPreviewSchema.safeParse(value);

    if (!preview.success) {
      return;
    }

    setPendingPreview(preview.data);
  };

  const handleConfirmPreview = async () => {
    if (!pendingPreview || !pendingPreview.canConfirm || isConfirmingPreview) {
      return;
    }

    try {
      setIsConfirmingPreview(true);

      await confirmChatbotPreviewTransaksi({
        data: pendingPreview,
      });

      setPendingPreview(null);
      await onConfirmSuccess?.();
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

  const handleDismissPreview = () => {
    setPendingPreview(null);
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
      clearPreview: handleDismissPreview,
    },
  };
}
