import type { TransaksiPreview } from '#/features/chatbot/chatbot.schema';
import { isPreviewStatusMessage, type RenderedChatMessage } from '#/lib/chatbot';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatPreviewCard } from './chat-preview-card';
import { ChatTypingIndicator } from './chat-typing-indicator';

type ChatMessageListProps = {
  messages: RenderedChatMessage[];
  isLoading: boolean;
  preview: TransaksiPreview | null;
  isConfirmingPreview: boolean;
  onConfirmPreview: () => void;
  onDismissPreview: () => void;
};

export function ChatMessageList({
  messages,
  isLoading,
  preview,
  isConfirmingPreview,
  onConfirmPreview,
  onDismissPreview,
}: ChatMessageListProps) {
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
