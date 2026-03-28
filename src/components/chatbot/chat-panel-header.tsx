import { Carrot, RotateCcw } from 'lucide-react';
import { Button } from '../selia/button';

type ChatPanelHeaderProps = {
  onClearChat: () => void;
};

export function ChatPanelHeader({ onClearChat }: ChatPanelHeaderProps) {
  return (
    <div className='w-full border-b border-popover-separator px-4 py-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-medium leading-none'>Eltrack Assistant</p>
        </div>

        <div className='flex items-center justify-center gap-2'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-1 text-[10px] font-medium text-muted'>
            <Carrot className='size-3' />
            AI
          </span>
          <Button
            size='xs-icon'
            variant='plain'
            className='ring-0 size-7 rounded-lg text-muted hover:text-foreground'
            onClick={onClearChat}
            aria-label='Mulai chat baru'
            title='Mulai chat baru'
          >
            <RotateCcw className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
