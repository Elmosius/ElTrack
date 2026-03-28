import type { RenderedChatMessage } from '#/lib/chatbot';

type ChatMessageBubbleProps = {
  message: RenderedChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={
          message.role === 'user'
            ? 'max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground'
            : 'max-w-[85%] rounded-xl rounded-bl-sm bg-accent px-3 py-2 text-xs text-foreground'
        }
      >
        {message.text ? <p className='whitespace-pre-wrap'>{message.text}</p> : null}
        {message.imageCount > 0 ? (
          <p
            className={`mt-1 text-[10px] ${
              message.role === 'user'
                ? 'text-primary-foreground/80'
                : 'text-muted'
            }`}
          >
            Foto terlampir{message.imageCount > 1 ? ` (${message.imageCount})` : ''}
          </p>
        ) : null}
      </div>
    </div>
  );
}
