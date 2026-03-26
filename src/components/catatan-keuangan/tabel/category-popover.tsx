import { useTransactionTable } from '#/hooks/use-transaction-table';
import type { TransaksiRow } from '#/types/transaction-table';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Popover, PopoverPopup, PopoverTrigger } from '@/components/selia/popover';
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from 'lucide-react';

type CategoryPopoverProps = {
  row: TransaksiRow;
};

export function CategoryPopover({ row }: CategoryPopoverProps) {
  const { state, actions } = useTransactionTable();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant='plain' className='w-full h-8 rounded px-2 text-left text-sm inline-flex items-center justify-between bg-accent/45 text-foreground hover:bg-accent'>
            <span className='truncate'>{state.categoryMap.get(row.kategoriId) || 'Pilih kategori'}</span>
            <ChevronDown className='size-3.5 text-muted shrink-0' />
          </Button>
        }
      />

      <PopoverPopup side='bottom' align='start' className='p-3 gap-2.5'>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-muted px-1'>Pilih Kategori</p>
          {state.categories.map((category) => {
            const isSelected = row.kategoriId === category.id;

            return (
              <div key={category.id} className='flex items-center gap-2'>
                <Button
                  onClick={() => actions.updateRow(row.id, { kategoriId: category.id })}
                  size='xs'
                  variant='plain'
                  className={`h-8 w-full rounded px-3 text-left text-sm inline-flex items-center justify-between hover:bg-accent ${isSelected ? 'bg-accent' : ''}`}
                >
                  <span className='truncate'>{category.name}</span>
                  {isSelected ? <Check className='size-3.5 text-primary shrink-0 ml-2' /> : null}
                </Button>
                <Button onClick={() => actions.handleEditCategory(category)} size='xs-icon' variant='plain' className='size-7 rounded text-muted hover:text-foreground hover:bg-accent' aria-label={`Edit ${category.name}`}>
                  <Pencil className='size-3.5' />
                </Button>
                <Button onClick={() => actions.requestDeleteCategory(category)} size='xs-icon' variant='plain' className='size-7 rounded text-muted hover:text-danger hover:bg-accent' aria-label={`Hapus ${category.name}`}>
                  <Trash2 className='size-3.5' />
                </Button>
              </div>
            );
          })}
        </div>

        <div className='h-px bg-popover-separator' />

        {state.categoryMode === 'idle' ? (
          <Button size='xs' variant='plain' className='w-full text-sm' onClick={actions.handleAddCategory}>
            <Plus className='size-3.5' />
            Tambah kategori
          </Button>
        ) : (
          <div className='space-y-2 w-full'>
            <p className='text-xs text-muted'>{state.categoryMode === 'add' ? 'Tambah kategori baru' : 'Edit nama kategori'}</p>
            <Input value={state.categoryDraft} onChange={(event) => actions.setCategoryDraft(event.target.value)} placeholder='Nama kategori' className='h-8 text-sm px-2.5' />
            {state.categoryError ? <p className='text-[11px] text-danger'>{state.categoryError}</p> : null}
            <div className='flex items-center justify-end gap-1.5'>
              <Button size='xs' variant='plain' className={'text-sm'} onClick={actions.resetCategoryEditor}>
                <X className='size-3.5' />
                Batal
              </Button>
              <Button size='xs' variant='secondary' className={'text-sm'} onClick={actions.handleSaveCategory}>
                <Check className='size-3.5' />
                Simpan
              </Button>
            </div>
          </div>
        )}

        {state.categoryMode === 'idle' && state.categoryError ? <p className='text-[11px] text-danger px-1'>{state.categoryError}</p> : null}
      </PopoverPopup>
    </Popover>
  );
}
