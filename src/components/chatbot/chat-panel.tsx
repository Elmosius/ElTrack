import { useChatbotPanel } from '#/hooks/use-chatbot-panel';
import { PopoverPopup } from '../selia/popover';
import { ChatComposer } from './chat-composer';
import { ChatMessageList } from './chat-message-list';
import { ChatPanelHeader } from './chat-panel-header';

export function ChatPanel() {
  const { state, derived, actions, refs } = useChatbotPanel();

  return (
    <PopoverPopup
      side='top'
      align='end'
      sideOffset={14}
      className='w-[min(92vw,23rem)] p-0 gap-0 overflow-hidden rounded-xl'
    >
      <ChatPanelHeader
        sessions={state.sessions}
        activeSessionId={state.activeSessionId}
        isLoading={
          state.isBootstrapping || state.isSwitchingSession || state.isLoading
        }
        onClearChat={() => void actions.handleClearChat()}
        onSelectSession={(chatSessionId) =>
          void actions.handleSelectSession(chatSessionId)
        }
      />

      <ChatMessageList
        messages={derived.renderedMessages}
        isLoading={state.isLoading}
        preview={state.pendingPreview}
        isConfirmingPreview={state.isConfirmingPreview}
        onConfirmPreview={actions.handleConfirmPreview}
        onDismissPreview={actions.handleDismissPreview}
      />

      <ChatComposer
        draft={state.draft}
        attachmentName={state.attachmentName}
        isLoading={state.isLoading}
        isDisabled={state.isBootstrapping || state.isSwitchingSession}
        textareaRef={refs.textareaRef}
        fileInputRef={refs.fileInputRef}
        onDraftChange={actions.setDraft}
        onComposerKeyDown={actions.handleComposerKeyDown}
        onAttachmentSelect={actions.handleAttachmentSelect}
        onAttachmentClick={actions.handleAttachmentClick}
        onSend={() => void actions.handleSend()}
      />
    </PopoverPopup>
  );
}
