import { useTransactionTableCategoryPopover } from '#/hooks/transaction-table/use-transaction-table';
import type { TransaksiRow } from '#/types/transaction-table';
import { Popover, PopoverPopup, PopoverTrigger } from '@/components/selia/popover';
import { CategoryPopoverEditor } from './category-popover-editor';
import { CategoryPopoverOption } from './category-popover-option';
import { CategoryPopoverTrigger } from './category-popover-trigger';

type CategoryPopoverProps = {
  row: TransaksiRow;
};

export function CategoryPopover({ row }: CategoryPopoverProps) {
  const { categories, categoryMap, categoryMode, categoryDraft, categoryError, updateRow, saveRow, handleAddCategory, handleEditCategory, requestDeleteCategory, setCategoryDraft, resetCategoryEditor, handleSaveCategory } =
    useTransactionTableCategoryPopover();
  const selectedCategoryLabel = categoryMap.get(row.kategoriId) || 'Pilih kategori';

  return (
    <Popover>
      <PopoverTrigger render={<CategoryPopoverTrigger label={selectedCategoryLabel} />} />

      <PopoverPopup side='bottom' align='start' className='p-3 gap-2.5'>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-muted px-1'>Pilih Kategori</p>
          {categories.map((category) => {
            const isSelected = row.kategoriId === category.id;

            return (
              <CategoryPopoverOption
                key={category.id}
                category={category}
                isSelected={isSelected}
                onSelect={() => {
                  updateRow(row.id, { kategoriId: category.id });
                  void saveRow(row.id);
                }}
                onEdit={() => handleEditCategory(category)}
                onDelete={() => requestDeleteCategory(category)}
              />
            );
          })}
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

        {categoryMode === 'idle' && categoryError ? <p className='text-[11px] text-danger px-1'>{categoryError}</p> : null}
      </PopoverPopup>
    </Popover>
  );
}
