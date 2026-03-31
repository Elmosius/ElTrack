import { useChatbotPanel } from '#/hooks/use-chatbot-panel';
import { PopoverPopup } from '../selia/popover';
import { ChatComposer } from './chat-composer';
import { ChatMessageList } from './chat-message-list';
import { ChatPanelHeader } from './chat-panel-header';

export function ChatPanel() {
  const { sections } = useChatbotPanel();

  return (
    <PopoverPopup
      side='top'
      align='end'
      sideOffset={14}
      className='w-[min(92vw,23rem)] p-0 gap-0 overflow-hidden rounded-xl'
    >
      <ChatPanelHeader header={sections.header} />

      <ChatMessageList messageList={sections.messageList} />

      <ChatComposer composer={sections.composer} />
    </PopoverPopup>
  );
}
