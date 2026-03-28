import type { TransaksiPreview } from '#/features/chatbot/chatbot.schema';
import type { RenderedChatMessage } from '#/lib/chatbot';
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
  return (
    <div className='w-full max-h-72 overflow-y-auto px-4 py-3 space-y-3'>
      {messages.map((message) => (
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
