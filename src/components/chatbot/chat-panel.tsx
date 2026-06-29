import { useChatbotPanel } from '#/hooks/chatbot/use-chatbot-panel';
import { PopoverPopup } from '../selia/popover';
import { ChatComposerSection } from './chat-composer-section';
import { ChatMessageList } from './chat-message-list';
import { ChatPanelHeader } from './chat-panel-header';

type ChatPanelProps = {
  isOpen: boolean;
};

export function ChatPanel({ isOpen }: ChatPanelProps) {
  const { sections } = useChatbotPanel();

  return (
    <PopoverPopup
      side='top'
      align='end'
      sideOffset={12}
      collisionPadding={12}
      className='max-h-[calc(100dvh-6rem)] w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden rounded-xl md:w-[min(92vw,23rem)]'
    >
      <ChatPanelHeader header={sections.header} />

      <ChatMessageList
        messageList={sections.messageList}
        isOpen={isOpen}
      />

      <ChatComposerSection composer={sections.composer} />
    </PopoverPopup>
  );
}
