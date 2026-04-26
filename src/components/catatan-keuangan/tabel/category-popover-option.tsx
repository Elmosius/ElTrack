import type { Kategori } from '#/types/transaction-table';
import { Button } from '@/components/selia/button';
import { Check, Pencil, Trash2 } from 'lucide-react';

type CategoryPopoverOptionProps = {
  category: Kategori;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function CategoryPopoverOption({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryPopoverOptionProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        onClick={onSelect}
        size='xs'
        variant='plain'
        className={`h-8 w-full rounded px-3 text-left text-sm inline-flex items-center justify-between hover:bg-accent ${isSelected ? 'bg-accent' : ''}`}
      >
        <span className='truncate'>{category.name}</span>
        {isSelected ? <Check className='size-3.5 text-primary shrink-0 ml-2' /> : null}
      </Button>
      <Button onClick={onEdit} size='xs-icon' variant='plain' className='size-7 rounded text-muted hover:text-foreground hover:bg-accent' aria-label={`Edit ${category.name}`}>
        <Pencil className='size-3.5' />
      </Button>
      <Button onClick={onDelete} size='xs-icon' variant='plain' className='size-7 rounded text-muted hover:text-danger hover:bg-accent' aria-label={`Hapus ${category.name}`}>
        <Trash2 className='size-3.5' />
      </Button>
    </div>
  );
}
