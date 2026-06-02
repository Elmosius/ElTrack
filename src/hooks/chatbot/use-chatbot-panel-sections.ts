import type {
  ChatComposerSectionViewModel,
  ChatMessageListViewModel,
  ChatPanelHeaderViewModel,
} from '#/lib/chatbot/view-models';
import type { RenderedChatMessage } from '#/lib/chatbot/messages';
import type {
  ChatbotPreviewEditOptions,
  ChatSessionSummary,
  TransaksiPreviewItemPatch,
  TransaksiPreviewGroup,
} from '#/types/chatbot';
import { useMemo } from 'react';

type UseChatbotPanelSectionsArgs = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isBootstrapping: boolean;
  isSwitchingSession: boolean;
  isLoading: boolean;
  renderedMessages: RenderedChatMessage[];
  pendingPreview: TransaksiPreviewGroup | null;
  previewOptions: ChatbotPreviewEditOptions | null;
  isConfirmingPreview: boolean;
  isPatchingPreview: boolean;
  composerResetVersion: number;
  handleSend: ChatComposerSectionViewModel['onSubmit'];
  handleClearChat: () => Promise<void>;
  handleSelectSession: (chatSessionId: string) => Promise<void>;
  handleConfirmPreview: () => Promise<void>;
  handleDismissPreview: () => Promise<void>;
  handlePatchPreviewItem: (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => Promise<boolean>;
};

export function useChatbotPanelSections({
  sessions,
  activeSessionId,
  isBootstrapping,
  isSwitchingSession,
  isLoading,
  renderedMessages,
  pendingPreview,
  previewOptions,
  isConfirmingPreview,
  isPatchingPreview,
  composerResetVersion,
  handleSend,
  handleClearChat,
  handleSelectSession,
  handleConfirmPreview,
  handleDismissPreview,
  handlePatchPreviewItem,
}: UseChatbotPanelSectionsArgs) {
  const isSessionBusy = isBootstrapping || isSwitchingSession;
  const isHeaderLoading = isSessionBusy || isLoading;

  const header: ChatPanelHeaderViewModel = useMemo(
    () => ({
      sessions,
      activeSessionId,
      isLoading: isHeaderLoading,
      onClearChat: () => void handleClearChat(),
      onSelectSession: (chatSessionId) =>
        void handleSelectSession(chatSessionId),
    }),
    [
      activeSessionId,
      handleClearChat,
      handleSelectSession,
      isHeaderLoading,
      sessions,
    ],
  );

  const messageList: ChatMessageListViewModel = useMemo(
    () => ({
      messages: renderedMessages,
      isLoading,
      preview: pendingPreview,
      previewOptions,
      isConfirmingPreview,
      isPatchingPreview,
      onConfirmPreview: handleConfirmPreview,
      onDismissPreview: handleDismissPreview,
      onPatchPreviewItem: handlePatchPreviewItem,
    }),
    [
      handleConfirmPreview,
      handleDismissPreview,
      handlePatchPreviewItem,
      isConfirmingPreview,
      isPatchingPreview,
      isLoading,
      pendingPreview,
      previewOptions,
      renderedMessages,
    ],
  );

  const composer: ChatComposerSectionViewModel = useMemo(
    () => ({
      isLoading,
      isDisabled: isSessionBusy,
      resetVersion: composerResetVersion,
      onSubmit: handleSend,
    }),
    [composerResetVersion, handleSend, isLoading, isSessionBusy],
  );

  return {
    header,
    messageList,
    composer,
  };
}
