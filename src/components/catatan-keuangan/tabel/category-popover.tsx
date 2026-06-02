import { useTransactionTableCategoryPopover } from '#/hooks/transaction-table/use-transaction-table';
import type { TransaksiRow } from '#/types/transaction-table';
import { Popover, PopoverPopup, PopoverTrigger } from '@/components/selia/popover';
import { useState } from 'react';
import { CategoryPopoverEditor } from './category-popover-editor';
import { CategoryPopoverOption } from './category-popover-option';
import { CategoryPopoverTrigger } from './category-popover-trigger';

type CategoryPopoverProps = {
  row: TransaksiRow;
};

export function CategoryPopover({ row }: CategoryPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { categories, categoryMap, categoryMode, categoryDraft, categoryError, updateRow, saveRow, handleAddCategory, handleEditCategory, requestDeleteCategory, setCategoryDraft, resetCategoryEditor, handleSaveCategory } =
    useTransactionTableCategoryPopover();
  const hasCategories = categories.length > 0;
  const selectedCategoryLabel = categoryMap.get(row.kategoriId) || 'Pilih kategori';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className='w-full h-8 rounded px-2 text-left text-sm inline-flex items-center justify-between bg-accent/45 text-foreground hover:bg-accent'>
        <CategoryPopoverTrigger
          label={selectedCategoryLabel}
          hasCategories={hasCategories}
        />
      </PopoverTrigger>

      <PopoverPopup
        side='bottom'
        align='start'
        className='z-50 min-w-64 max-w-[min(90vw,20rem)] p-3 gap-2.5'
      >
        <div className='space-y-1'>
          <p className='text-xs font-medium text-muted px-1'>Pilih Kategori</p>
          {hasCategories ? (
            categories.map((category) => {
              const isSelected = row.kategoriId === category.id;

              return (
                <CategoryPopoverOption
                  key={category.id}
                  category={category}
                  isSelected={isSelected}
                  onSelect={() => {
                    setIsOpen(false);
                    updateRow(row.id, { kategoriId: category.id });
                    void saveRow(row.id);
                  }}
                  onEdit={() => handleEditCategory(category)}
                  onDelete={() => requestDeleteCategory(category)}
                />
              );
            })
          ) : (
            <div className='rounded border border-dashed border-border px-3 py-2 text-xs text-muted'>
              Belum ada kategori tersimpan. Tambah kategori dulu, lalu pilih dari daftar ini.
            </div>
          )}
        </div>

        <div className='h-px bg-popover-separator' />

        <CategoryPopoverEditor
          mode={categoryMode}
          draft={categoryDraft}
          error={categoryError}
          onAdd={handleAddCategory}
          onDraftChange={setCategoryDraft}
          onCancel={resetCategoryEditor}
          onSave={handleSaveCategory}
        />

        {categoryMode === 'idle' && categoryError ? <p className='text-xs text-danger px-1'>{categoryError}</p> : null}
      </PopoverPopup>
    </Popover>
  );
}
