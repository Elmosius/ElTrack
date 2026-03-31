import type {
  ChatComposerSectionViewModel,
  ChatComposerViewModel,
} from '#/lib/chatbot/view-models';
import { useChatbotComposer } from '#/hooks/use-chatbot-composer';
import { useMemo } from 'react';
import { ChatComposer } from './chat-composer';

type ChatComposerSectionProps = {
  composer: ChatComposerSectionViewModel;
};

export function ChatComposerSection({
  composer,
}: ChatComposerSectionProps) {
  const composerController = useChatbotComposer({
    resetVersion: composer.resetVersion,
    onSubmit: composer.onSubmit,
  });

  const composerViewModel: ChatComposerViewModel = useMemo(
    () => ({
      draft: composerController.state.draft,
      attachmentName: composerController.state.attachmentName,
      isLoading: composer.isLoading,
      isDisabled: composer.isDisabled,
      textareaRef: composerController.refs.textareaRef,
      fileInputRef: composerController.refs.fileInputRef,
      onDraftChange: composerController.actions.setDraft,
      onComposerKeyDown: composerController.actions.handleComposerKeyDown,
      onAttachmentSelect: composerController.actions.handleAttachmentSelect,
      onAttachmentClick: composerController.actions.handleAttachmentClick,
      onSend: composerController.actions.handleSend,
    }),
    [composer, composerController],
  );

  return <ChatComposer composer={composerViewModel} />;
}
