import type { ChatSessionSummary } from '#/features/chatbot/chatbot.schema';
import { Carrot, RotateCcw } from 'lucide-react';
import { Button } from '../selia/button';
import { ChatSessionSwitcher } from './chat-session-switcher';

type ChatPanelHeaderProps = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isLoading: boolean;
  onClearChat: () => void;
  onSelectSession: (chatSessionId: string) => void;
};

export function ChatPanelHeader({
  sessions,
  activeSessionId,
  isLoading,
  onClearChat,
  onSelectSession,
}: ChatPanelHeaderProps) {
  return (
    <div className='w-full border-b border-popover-separator px-4 py-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-sm font-medium leading-none'>Eltrack Assistant</p>
          <div className='mt-2'>
            <ChatSessionSwitcher
              sessions={sessions}
              activeSessionId={activeSessionId}
              isLoading={isLoading}
              onSelectSession={onSelectSession}
            />
          </div>
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
            disabled={isLoading}
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
