import type { SelectOption, TransaksiRow } from '#/types/transaction-table';
import type { TransactionTableStore } from '#/stores/transaction-table.store.types';

export function createOptionMap(options: SelectOption[]) {
  return new Map(options.map((option) => [option.id, option.name]));
}

export function createFilteredRows(
  rows: TransaksiRow[],
  selectedDate: string,
) {
  return rows.filter((row) => row.tanggal === selectedDate);
}

export function selectTransactionTableHeader(state: TransactionTableStore) {
  return {
    selectedDate: state.selectedDate,
    setSelectedDate: state.setSelectedDate,
  };
}

export function selectTransactionTableContent(state: TransactionTableStore) {
  return {
    handleAddRow: state.handleAddRow,
    syncError: state.syncError,
  };
}

export function selectTransactionTableBodyActions(
  state: TransactionTableStore,
) {
  return {
    updateRow: state.updateRow,
    handleNominalChange: state.handleNominalChange,
    handleDeleteRow: state.handleDeleteRow,
    saveRow: state.saveRow,
  };
}

export function selectTransactionTableDeleteDialog(
  state: TransactionTableStore,
) {
  return {
    isDeleteDialogOpen: state.isDeleteDialogOpen,
    setIsDeleteDialogOpen: state.setIsDeleteDialogOpen,
    clearDeleteTarget: state.clearDeleteTarget,
    confirmDeleteCategory: state.confirmDeleteCategory,
  };
}

export function selectTransactionTableCategoryPopoverActions(
  state: TransactionTableStore,
) {
  return {
    updateRow: state.updateRow,
    saveRow: state.saveRow,
    handleAddCategory: state.handleAddCategory,
    handleEditCategory: state.handleEditCategory,
    handleSaveCategory: state.handleSaveCategory,
    requestDeleteCategory: state.requestDeleteCategory,
    resetCategoryEditor: state.resetCategoryEditor,
    setCategoryDraft: state.setCategoryDraft,
  };
}
