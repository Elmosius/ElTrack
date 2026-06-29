import { useState } from 'react';
import { Popover } from '../selia/popover';
import { ChatPanel } from './chat-panel';
import { ChatTrigger } from './chat-trigger';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-50 md:bottom-5 md:right-5'>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <ChatTrigger isOpen={isOpen} />
        <ChatPanel isOpen={isOpen} />
      </Popover>
    </div>
  );
}
