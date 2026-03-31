import { isPreviewStatusMessage } from '#/lib/chatbot';
import type { ChatMessageListViewModel } from '#/lib/chatbot/view-models';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatPreviewCard } from './chat-preview-card';
import { ChatTypingIndicator } from './chat-typing-indicator';

type ChatMessageListProps = { messageList: ChatMessageListViewModel };

export function ChatMessageList({
  messageList,
}: ChatMessageListProps) {
  const {
    messages,
    isLoading,
    preview,
    isConfirmingPreview,
    onConfirmPreview,
    onDismissPreview,
  } = messageList;
  let hiddenPreviewMessageIndex = -1;

  if (preview) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];

      if (message && isPreviewStatusMessage(message)) {
        hiddenPreviewMessageIndex = index;
        break;
      }
    }
  }

  const visibleMessages =
    hiddenPreviewMessageIndex >= 0
      ? messages.filter((_, index) => index !== hiddenPreviewMessageIndex)
      : messages;

  return (
    <div className='w-full max-h-72 overflow-y-auto px-4 py-3 space-y-3'>
      {visibleMessages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}

      {isLoading ? <ChatTypingIndicator /> : null}

      {preview ? (
        <ChatPreviewCard
          preview={preview}
          isConfirming={isConfirmingPreview}
          onConfirm={onConfirmPreview}
          onDismiss={onDismissPreview}
        />
      ) : null}
    </div>
  );
}
