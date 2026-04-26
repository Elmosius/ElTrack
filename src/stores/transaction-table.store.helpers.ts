import {
  createTransactionRow,
  getTodayDateString,
  isDraftTransactionId,
  toTransaksiMutationInput,
} from '#/lib/transaction-table';
import type {
  Kategori,
  TransactionTableData,
  TransaksiRow,
} from '#/types/transaction-table';
import type { TransactionTableStore } from './transaction-table.store.types';

type TransactionTableBaseState = Pick<
  TransactionTableStore,
  | 'rows'
  | 'selectedDate'
  | 'categories'
  | 'waktuOptions'
  | 'metodePembayaranOptions'
  | 'tipeOptions'
  | 'categoryMode'
  | 'categoryDraft'
  | 'editingCategoryId'
  | 'categoryError'
  | 'syncError'
  | 'deleteCategoryId'
  | 'isDeleteDialogOpen'
>;

type CategoryEditorState = Pick<
  TransactionTableStore,
  'categoryMode' | 'categoryDraft' | 'editingCategoryId' | 'categoryError'
>;

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Coba lagi.';
}

export function createInitialTransactionTableState(): TransactionTableBaseState {
  return {
    rows: [],
    selectedDate: getTodayDateString(),
    categories: [],
    waktuOptions: [],
    metodePembayaranOptions: [],
    tipeOptions: [],
    categoryMode: 'idle',
    categoryDraft: '',
    editingCategoryId: null,
    categoryError: '',
    syncError: '',
    deleteCategoryId: null,
    isDeleteDialogOpen: false,
  };
}

export function createHydratedTransactionTablePatch(
  selectedDate: string,
  data: TransactionTableData,
) {
  return {
    rows: data.rows,
    categories: data.categories,
    waktuOptions: data.waktuOptions,
    metodePembayaranOptions: data.metodePembayaranOptions,
    tipeOptions: data.tipeOptions,
    selectedDate: selectedDate || getTodayDateString(),
    categoryError: '',
    syncError: '',
  };
}

export function createAddRowPatch(
  state: Pick<
    TransactionTableStore,
    | 'rows'
    | 'selectedDate'
    | 'categories'
    | 'waktuOptions'
    | 'metodePembayaranOptions'
    | 'tipeOptions'
  >,
) {
  const fallbackCategoryId = state.categories[0]?.id ?? '';

  return {
    syncError: '',
    rows: [
      ...state.rows,
      createTransactionRow({
        tanggal: state.selectedDate,
        defaultCategoryId: fallbackCategoryId,
        defaultWaktuId: state.waktuOptions[0]?.id ?? '',
        defaultMetodePembayaranId:
          state.metodePembayaranOptions[0]?.id ?? '',
        defaultTipeId: state.tipeOptions[0]?.id ?? '',
      }),
    ],
  };
}

export function validateRowBeforeSave(row: TransaksiRow) {
  const payload = toTransaksiMutationInput(row);

  if (!payload.namaTransaksi) {
    return {
      payload,
      error: 'Nama transaksi wajib diisi sebelum disimpan.',
    };
  }

  if (!payload.kategori) {
    return {
      payload,
      error: 'Kategori wajib dipilih sebelum disimpan.',
    };
  }

  if (!payload.waktu || !payload.metodePembayaran || !payload.tipe) {
    return {
      payload,
      error: 'Waktu, metode pembayaran, dan tipe wajib dipilih sebelum disimpan.',
    };
  }

  return {
    payload,
    error: null,
  };
}

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

export function createDeleteRowPatch(rows: TransaksiRow[], rowId: string) {
  return {
    syncError: '',
    rows: rows.filter((row) => row.id !== rowId),
  };
}

export function isPersistedTransactionRow(rowId: string) {
  return !isDraftTransactionId(rowId);
}
