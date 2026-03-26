import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/selia/tooltip';
import { Carrot } from 'lucide-react';
import { Button } from '../selia/button';
import { PopoverTrigger } from '../selia/popover';

type ChatTriggerProps = {
  isOpen: boolean;
};

export function ChatTrigger({ isOpen }: ChatTriggerProps) {
  return (
    <Tooltip disabled={isOpen}>
      <TooltipTrigger
        delay={40}
        render={
          <PopoverTrigger
            render={
              <Button size='sm-icon' variant='primary' className='ring-0 rounded-full size-11 hover:scale-105 transition-transform ease-out duration-150 bg-primary shadow-md'>
                <Carrot className='size-4' />
              </Button>
            }
          />
        }
      />
      <TooltipPopup side='top' align='start' className='text-xs duration-100'>
        Mau aku bantu apa? Aku siap membantu!
      </TooltipPopup>
    </Tooltip>
  );
}
