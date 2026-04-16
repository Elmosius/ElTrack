import type { ChatSessionSummary } from '#/types/chatbot';
import { ChevronDown } from 'lucide-react';
import { Button } from '../selia/button';
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '../selia/menu';

type ChatSessionSwitcherProps = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isLoading: boolean;
  onSelectSession: (chatSessionId: string) => void;
};

function formatSessionMeta(session: ChatSessionSummary) {
  const rawDate =
    session.lastOpenedAt ||
    session.lastMessageAt ||
    session.updatedAt ||
    session.createdAt;

  if (!rawDate) {
    return 'Belum ada pesan';
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return 'Percakapan tersimpan';
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function ChatSessionSwitcher({
  sessions,
  activeSessionId,
  isLoading,
  onSelectSession,
}: ChatSessionSwitcherProps) {
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const triggerLabel = isLoading
    ? 'Memuat chat...'
    : activeSession?.title || 'Pilih percakapan';

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant='plain'
            className='h-8 max-w-52 rounded-lg px-2.5 text-left text-xs inline-flex items-center justify-between bg-accent/45 text-foreground hover:bg-accent'
            disabled={isLoading}
          >
            <span className='truncate'>{triggerLabel}</span>
            <ChevronDown className='ml-2 size-3.5 shrink-0 text-muted' />
          </Button>
        }
      />
      <MenuPopup
        size='compact'
        align='start'
        className='w-72 max-h-72 overflow-y-auto'
      >
        <MenuGroup>
          <MenuGroupLabel className='px-2 py-1 text-[11px]'>
            Riwayat percakapan
          </MenuGroupLabel>
          {sessions.length > 0 ? (
            <MenuRadioGroup
              value={activeSessionId ?? ''}
              onValueChange={onSelectSession}
            >
              {sessions.map((session) => (
                <MenuRadioItem
                  key={session.id}
                  value={session.id}
                  className='flex-col items-start gap-0 px-2 py-2.5'
                >
                  <span className='w-full truncate text-xs font-medium text-foreground'>
                    {session.title}
                  </span>
                  <span className='mt-0.5 text-[10px] text-muted'>
                    {formatSessionMeta(session)}
                  </span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          ) : (
            <p className='px-2 py-2 text-xs text-muted'>
              Belum ada riwayat chat.
            </p>
          )}
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
