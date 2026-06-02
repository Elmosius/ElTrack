import type {
  Kategori,
  TransaksiRow,
} from '#/types/transaction-table';
import type { TransactionTableStore } from './transaction-table.store.types';

export type CategoryEditorState = Pick<
  TransactionTableStore,
  'categoryMode' | 'categoryDraft' | 'editingCategoryId' | 'categoryError'
>;

export function createResetCategoryEditorState(): CategoryEditorState {
  return {
    categoryMode: 'idle',
    categoryDraft: '',
    editingCategoryId: null,
    categoryError: '',
  };
}

export function createAddCategoryState(): CategoryEditorState {
  return {
    categoryMode: 'add',
    categoryDraft: '',
    editingCategoryId: null,
    categoryError: '',
  };
}

export function createEditCategoryState(
  category: Kategori,
): CategoryEditorState {
  return {
    categoryMode: 'edit',
    categoryDraft: category.name,
    editingCategoryId: category.id,
    categoryError: '',
  };
}

export function hasDuplicateCategoryName(
  categories: Kategori[],
  normalizedName: string,
  editingCategoryId: string | null,
) {
  return categories.some(
    (category) =>
      category.name.toLowerCase() === normalizedName.toLowerCase() &&
      category.id !== editingCategoryId,
  );
}

export function isCategoryUsedByRows(
  rows: TransaksiRow[],
  categoryId: string,
) {
  return rows.some((row) => row.kategoriId === categoryId);
}

export function createDeleteCategorySuccessState(
  categories: Kategori[],
  deleteCategoryId: string,
) {
  return {
    categories: categories.filter((category) => category.id !== deleteCategoryId),
    deleteCategoryId: null,
    isDeleteDialogOpen: false,
    ...createResetCategoryEditorState(),
  };
}
