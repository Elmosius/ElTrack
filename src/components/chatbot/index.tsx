import { useState } from 'react';
import { Popover } from '../selia/popover';
import { ChatPanel } from './chat-panel';
import { ChatTrigger } from './chat-trigger';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <ChatTrigger isOpen={isOpen} />
        <ChatPanel isOpen={isOpen} />
      </Popover>
    </div>
  );
}
