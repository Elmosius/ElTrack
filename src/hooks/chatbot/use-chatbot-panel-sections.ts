import type {
  ChatComposerSectionViewModel,
  ChatMessageListViewModel,
  ChatPanelHeaderViewModel,
} from '#/lib/chatbot/view-models';
import type { RenderedChatMessage } from '#/lib/chatbot/messages';
import type { ChatSessionSummary, TransaksiPreviewGroup } from '#/types/chatbot';
import { useMemo } from 'react';

type UseChatbotPanelSectionsArgs = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isBootstrapping: boolean;
  isSwitchingSession: boolean;
  isLoading: boolean;
  renderedMessages: RenderedChatMessage[];
  pendingPreview: TransaksiPreviewGroup | null;
  isConfirmingPreview: boolean;
  composerResetVersion: number;
  handleSend: ChatComposerSectionViewModel['onSubmit'];
  handleClearChat: () => Promise<void>;
  handleSelectSession: (chatSessionId: string) => Promise<void>;
  handleConfirmPreview: () => Promise<void>;
  handleDismissPreview: () => Promise<void>;
};

export function useChatbotPanelSections({
  sessions,
  activeSessionId,
  isBootstrapping,
  isSwitchingSession,
  isLoading,
  renderedMessages,
  pendingPreview,
  isConfirmingPreview,
  composerResetVersion,
  handleSend,
  handleClearChat,
  handleSelectSession,
  handleConfirmPreview,
  handleDismissPreview,
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
      isConfirmingPreview,
      onConfirmPreview: handleConfirmPreview,
      onDismissPreview: handleDismissPreview,
    }),
    [
      handleConfirmPreview,
      handleDismissPreview,
      isConfirmingPreview,
      isLoading,
      pendingPreview,
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
