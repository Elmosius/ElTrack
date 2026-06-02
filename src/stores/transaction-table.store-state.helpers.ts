import { createTransactionRow, getTodayDateString } from '#/lib/transaction-table';
import type { TransactionTableData } from '#/types/transaction-table';
import type { TransactionTableStore } from './transaction-table.store.types';

export type TransactionTableBaseState = Pick<
  TransactionTableStore,
  | 'rows'
  | 'selectedDate'
  | 'categories'
  | 'waktuOptions'
  | 'kantongOptions'
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

export type AddRowState = Pick<
  TransactionTableStore,
  | 'rows'
  | 'selectedDate'
  | 'categories'
  | 'waktuOptions'
  | 'kantongOptions'
  | 'tipeOptions'
>;

export function createInitialTransactionTableState(): TransactionTableBaseState {
  return {
    rows: [],
    selectedDate: getTodayDateString(),
    categories: [],
    waktuOptions: [],
    kantongOptions: [],
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
    kantongOptions: data.kantongOptions,
    metodePembayaranOptions: data.metodePembayaranOptions,
    tipeOptions: data.tipeOptions,
    selectedDate: selectedDate || getTodayDateString(),
    categoryError: '',
    syncError: '',
  };
}

export function createAddRowPatch(state: AddRowState) {
  return {
    syncError: '',
    rows: [
      ...state.rows,
      createTransactionRow({
        tanggal: state.selectedDate,
        defaultCategoryId: state.categories[0]?.id ?? '',
        defaultWaktuId: state.waktuOptions[0]?.id ?? '',
        defaultKantongId: state.kantongOptions[0]?.id ?? '',
        defaultTipeId: state.tipeOptions[0]?.id ?? '',
      }),
    ],
  };
}
