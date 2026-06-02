import {
  confirmChatbotPreviewTransaksi,
  dismissChatbotPreviewSession,
  getChatbotPreviewOptions,
  patchChatbotPreviewItemDraft,
} from '#/features/chatbot/chatbot.functions';
import {
  chatbotPreviewEventName,
  chatbotPreviewEventPayloadSchema,
  isMeaningfulPreviewItem,
  transaksiPreviewGroupSchema,
} from '#/features/chatbot/chatbot.schema';
import { getErrorMessage } from '#/lib/chatbot';
import type {
  ChatbotPreviewEditOptions,
  ConfirmChatbotPreviewResult,
  TransaksiPreviewItemPatch,
  TransaksiPreviewGroup,
} from '#/types/chatbot';
import { toastManager } from '@/components/selia/toast';
import { useEffect, useRef, useState } from 'react';

type UseChatbotPreviewOptions = {
  getActiveSessionId: () => string | null;
  getActiveRequestId: () => string | null;
  onDismissStart?: () => Promise<void> | void;
  onConfirmSuccess?: (
    result: ConfirmChatbotPreviewResult,
  ) => Promise<void> | void;
  onDismissSuccess?: () => Promise<void> | void;
};

export function useChatbotPreview({
  getActiveSessionId,
  getActiveRequestId,
  onDismissStart,
  onConfirmSuccess,
  onDismissSuccess,
}: UseChatbotPreviewOptions) {
  const [pendingPreview, setPendingPreview] = useState<TransaksiPreviewGroup | null>(
    null,
  );
  const [previewOptions, setPreviewOptions] =
    useState<ChatbotPreviewEditOptions | null>(null);
  const [isConfirmingPreview, setIsConfirmingPreview] = useState(false);
  const [pendingPatchCount, setPendingPatchCount] = useState(0);
  const patchQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const isPatchingPreview = pendingPatchCount > 0;

  useEffect(() => {
    if (!pendingPreview || previewOptions) {
      return;
    }

    let isActive = true;

    void getChatbotPreviewOptions()
      .then((options: ChatbotPreviewEditOptions) => {
        if (isActive) {
          setPreviewOptions(options);
        }
      })
      .catch((optionsError) => {
        console.error('Load chatbot preview options error:', optionsError);
      });

    return () => {
      isActive = false;
    };
  }, [pendingPreview, previewOptions]);

  const handleCustomEvent = (eventType: string, value: unknown) => {
    if (eventType !== chatbotPreviewEventName) {
      return;
    }

    const payload = chatbotPreviewEventPayloadSchema.safeParse(value);
    const activeSessionId = getActiveSessionId();
    const activeRequestId = getActiveRequestId();

    if (payload.success) {
      if (
        payload.data.chatSessionId !== activeSessionId ||
        payload.data.requestId !== activeRequestId
      ) {
        return;
      }

      setMeaningfulPreview(payload.data.preview);
      return;
    }

    if (activeRequestId) {
      return;
    }

    const preview = transaksiPreviewGroupSchema.safeParse(value);

    if (!preview.success) {
      return;
    }

    setMeaningfulPreview(preview.data);
  };

  const setMeaningfulPreview = (preview: TransaksiPreviewGroup) => {
    const meaningfulItems = preview.items.filter((item) =>
      isMeaningfulPreviewItem(item),
    );

    if (meaningfulItems.length === 0) {
      return;
    }

    setPendingPreview({
      ...preview,
      items: meaningfulItems,
    });
  };

  const handleConfirmPreview = async () => {
    const chatSessionId = getActiveSessionId();

    if (
      !chatSessionId ||
      !pendingPreview ||
      !pendingPreview.canConfirm ||
      isConfirmingPreview ||
      isPatchingPreview
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
    await onDismissStart?.();

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

  const runPatchPreviewItem = async (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => {
    const chatSessionId = getActiveSessionId();

    if (!chatSessionId) {
      return false;
    }

    try {
      setPendingPatchCount((current) => current + 1);
      const nextPreview = (await patchChatbotPreviewItemDraft({
        data: {
          chatSessionId,
          itemIndex,
          patch,
        },
      })) as TransaksiPreviewGroup;

      setMeaningfulPreview(nextPreview);
      return true;
    } catch (patchError) {
      toastManager.add({
        type: 'error',
        title: 'Gagal memperbarui preview',
        description: getErrorMessage(patchError),
      });
      return false;
    } finally {
      setPendingPatchCount((current) => Math.max(0, current - 1));
    }
  };

  const handlePatchPreviewItem = (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => {
    const nextPatch = patchQueueRef.current
      .catch(() => undefined)
      .then(() => runPatchPreviewItem(itemIndex, patch));

    patchQueueRef.current = nextPatch;
    return nextPatch;
  };

  return {
    state: {
      pendingPreview,
      previewOptions,
      isConfirmingPreview,
      isPatchingPreview,
    },
    actions: {
      handleCustomEvent,
      handleConfirmPreview,
      handleDismissPreview,
      handlePatchPreviewItem,
      clearPreview() {
        setPendingPreview(null);
      },
      setPendingPreview,
    },
  };
}
