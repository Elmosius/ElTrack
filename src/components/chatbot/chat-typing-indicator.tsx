export function ChatTypingIndicator() {
  return (
    <div className='flex justify-start'>
      <div className='max-w-[85%] rounded-xl rounded-bl-sm bg-accent px-3 py-2 text-xs text-foreground'>
        <p className='text-[11px] text-muted'>Aimo sedang mengetik...</p>
        <div className='mt-1 flex items-center gap-1'>
          <span className='size-1.5 rounded-full bg-foreground/55 animate-pulse [animation-delay:0ms]' />
          <span className='size-1.5 rounded-full bg-foreground/55 animate-pulse [animation-delay:180ms]' />
          <span className='size-1.5 rounded-full bg-foreground/55 animate-pulse [animation-delay:360ms]' />
        </div>
      </div>
    </div>
  );
}
