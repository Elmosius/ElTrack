import { sanitizeNominal } from '#/lib/transaction-table';
import {
  createAddCategoryState,
  createAddRowPatch,
  createEditCategoryState,
  createHydratedTransactionTablePatch,
  createResetCategoryEditorState,
  isCategoryUsedByRows,
} from './transaction-table.store.helpers';
import type { TransactionTableStore } from './transaction-table.store.types';
import type {
  TransactionTableGet,
  TransactionTableSet,
} from './transaction-table.store.shared';

type BaseActions = Pick<
  TransactionTableStore,
  | 'hydrateData'
  | 'setCategoryDraft'
  | 'setSelectedDate'
  | 'setIsDeleteDialogOpen'
  | 'updateRow'
  | 'handleNominalChange'
  | 'handleAddRow'
  | 'handleAddCategory'
  | 'handleEditCategory'
  | 'resetCategoryEditor'
  | 'requestDeleteCategory'
  | 'clearDeleteTarget'
>;

export function createTransactionTableBaseActions(
  set: TransactionTableSet,
  get: TransactionTableGet,
): BaseActions {
  return {
    hydrateData: (data) =>
      set((state) =>
        createHydratedTransactionTablePatch(state.selectedDate, data),
      ),

    setCategoryDraft: (value) => set({ categoryDraft: value }),
    setSelectedDate: (value) => set({ selectedDate: value }),
    setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),

    updateRow: (rowId, patch) =>
      set((state) => ({
        syncError: '',
        rows: state.rows.map((row) =>
          row.id === rowId ? { ...row, ...patch } : row,
        ),
      })),

    handleNominalChange: (rowId, value) => {
      get().updateRow(rowId, { nominal: sanitizeNominal(value) });
    },

    handleAddRow: () => set((state) => createAddRowPatch(state)),

    handleAddCategory: () => set(createAddCategoryState()),

    handleEditCategory: (category) => set(createEditCategoryState(category)),

    resetCategoryEditor: () => set(createResetCategoryEditorState()),

    requestDeleteCategory: (category) => {
      if (isCategoryUsedByRows(get().rows, category.id)) {
        set({
          categoryError:
            'Kategori ini masih dipakai transaksi, jadi belum bisa dihapus.',
        });
        return;
      }

      set({
        categoryError: '',
        deleteCategoryId: category.id,
        isDeleteDialogOpen: true,
      });
    },

    clearDeleteTarget: () => set({ deleteCategoryId: null }),
  };
}
