import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

type CategoryPopoverTriggerProps = {
  label: string;
  hasCategories?: boolean;
};

export function CategoryPopoverTrigger({
  label,
  hasCategories = true,
}: CategoryPopoverTriggerProps) {
  return (
    <>
      <span className={cn('truncate', !hasCategories && 'text-muted')}>
        {label}
      </span>
      <ChevronDown className='size-3.5 text-muted shrink-0' />
    </>
  );
}
