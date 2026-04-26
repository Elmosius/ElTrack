import { Button } from '@/components/selia/button';
import { ChevronDown } from 'lucide-react';

type CategoryPopoverTriggerProps = {
  label: string;
};

export function CategoryPopoverTrigger({ label }: CategoryPopoverTriggerProps) {
  return (
    <Button variant='plain' className='w-full h-8 rounded px-2 text-left text-sm inline-flex items-center justify-between bg-accent/45 text-foreground hover:bg-accent'>
      <span className='truncate'>{label}</span>
      <ChevronDown className='size-3.5 text-muted shrink-0' />
    </Button>
  );
}
