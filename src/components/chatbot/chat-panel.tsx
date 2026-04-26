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
      sideOffset={14}
      className='w-[min(92vw,23rem)] p-0 gap-0 overflow-hidden rounded-xl'
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
