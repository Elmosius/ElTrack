import { isPreviewStatusMessage } from '#/lib/chatbot';
import type { ChatMessageListViewModel } from '#/lib/chatbot/view-models';
import { useEffect, useRef } from 'react';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatPreviewCard } from './chat-preview-card';
import { ChatTypingIndicator } from './chat-typing-indicator';

type ChatMessageListProps = {
  messageList: ChatMessageListViewModel;
  isOpen: boolean;
};

export function ChatMessageList({
  messageList,
  isOpen,
}: ChatMessageListProps) {
  const {
    messages,
    isLoading,
    preview,
    previewOptions,
    isConfirmingPreview,
    isPatchingPreview,
    onConfirmPreview,
    onDismissPreview,
    onPatchPreviewItem,
  } = messageList;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const container = scrollContainerRef.current;

      if (!container) {
        return;
      }

      container.scrollTop = container.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isLoading, isOpen, preview, visibleMessages]);

  return (
    <div
      ref={scrollContainerRef}
      className='w-full max-h-[calc(100dvh-20rem)] min-h-0 overflow-y-auto px-4 py-3 space-y-3 md:max-h-72'
    >
      {visibleMessages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}

      {isLoading ? <ChatTypingIndicator /> : null}

      {preview ? (
        <ChatPreviewCard
          preview={preview}
          previewOptions={previewOptions}
          isConfirming={isConfirmingPreview}
          isPatching={isPatchingPreview}
          onConfirm={onConfirmPreview}
          onDismiss={onDismissPreview}
          onPatchItem={onPatchPreviewItem}
        />
      ) : null}
    </div>
  );
}
