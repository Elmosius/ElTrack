import { useTransactionTableStore } from '#/stores/transaction-table';
import type { TransactionTableData } from '#/types/transaction-table';
import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  createFilteredRows,
  createOptionMap,
  selectTransactionTableBodyActions,
  selectTransactionTableCategoryPopoverActions,
  selectTransactionTableContent,
  selectTransactionTableDeleteDialog,
  selectTransactionTableHeader,
} from './use-transaction-table.helpers';

export function useHydrateTransactionTable(data: TransactionTableData) {
  const hydrateData = useTransactionTableStore((state) => state.hydrateData);

  useEffect(() => {
    hydrateData(data);
  }, [data, hydrateData]);
}

export function useTransactionTable() {
  const rows = useTransactionTableStore((state) => state.rows);
  const selectedDate = useTransactionTableStore((state) => state.selectedDate);
  const categories = useTransactionTableStore((state) => state.categories);
  const categoryMode = useTransactionTableStore((state) => state.categoryMode);
  const categoryDraft = useTransactionTableStore((state) => state.categoryDraft);
  const categoryError = useTransactionTableStore((state) => state.categoryError);
  const deleteCategoryId = useTransactionTableStore(
    (state) => state.deleteCategoryId,
  );
  const actions = useTransactionTableStore(
    useShallow((state) => ({
      ...selectTransactionTableHeader(state),
      ...selectTransactionTableContent(state),
      ...selectTransactionTableBodyActions(state),
      ...selectTransactionTableDeleteDialog(state),
      ...selectTransactionTableCategoryPopoverActions(state),
    })),
  );
  const syncError = actions.syncError;
  const isDeleteDialogOpen = actions.isDeleteDialogOpen;

  const categoryMap = useMemo(() => createOptionMap(categories), [categories]);
  const filteredRows = useMemo(
    () => createFilteredRows(rows, selectedDate),
    [rows, selectedDate],
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === deleteCategoryId),
    [categories, deleteCategoryId],
  );

  return {
    state: {
      rows,
      filteredRows,
      selectedDate,
      categories,
      categoryMap,
      syncError,
      categoryMode,
      categoryDraft,
      categoryError,
      isDeleteDialogOpen,
      selectedCategory,
    },
    actions,
  };
}

export function useTransactionTableHeader() {
  return useTransactionTableStore(useShallow(selectTransactionTableHeader));
}

export function useTransactionTableContent() {
  return useTransactionTableStore(useShallow(selectTransactionTableContent));
}

export function useTransactionTableBody() {
  const rows = useTransactionTableStore((state) => state.rows);
  const selectedDate = useTransactionTableStore((state) => state.selectedDate);
  const waktuOptions = useTransactionTableStore((state) => state.waktuOptions);
  const metodePembayaranOptions = useTransactionTableStore((state) => state.metodePembayaranOptions);
  const tipeOptions = useTransactionTableStore((state) => state.tipeOptions);
  const actions = useTransactionTableStore(
    useShallow(selectTransactionTableBodyActions),
  );

  const filteredRows = useMemo(
    () => createFilteredRows(rows, selectedDate),
    [rows, selectedDate],
  );
  const waktuMap = useMemo(() => createOptionMap(waktuOptions), [waktuOptions]);
  const metodePembayaranMap = useMemo(
    () => createOptionMap(metodePembayaranOptions),
    [metodePembayaranOptions],
  );
  const tipeMap = useMemo(() => createOptionMap(tipeOptions), [tipeOptions]);

  return {
    filteredRows,
    waktuOptions,
    metodePembayaranOptions,
    tipeOptions,
    waktuMap,
    metodePembayaranMap,
    tipeMap,
    ...actions,
  };
}

export function useTransactionTableDeleteDialog() {
  const categories = useTransactionTableStore((state) => state.categories);
  const deleteCategoryId = useTransactionTableStore((state) => state.deleteCategoryId);

  const dialogState = useTransactionTableStore(
    useShallow(selectTransactionTableDeleteDialog),
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === deleteCategoryId),
    [categories, deleteCategoryId],
  );

  return {
    ...dialogState,
    selectedCategory,
  };
}

export function useTransactionTableCategoryPopover() {
  const categories = useTransactionTableStore((state) => state.categories);
  const categoryMode = useTransactionTableStore((state) => state.categoryMode);
  const categoryDraft = useTransactionTableStore((state) => state.categoryDraft);
  const categoryError = useTransactionTableStore((state) => state.categoryError);

  const actions = useTransactionTableStore(
    useShallow(selectTransactionTableCategoryPopoverActions),
  );

  const categoryMap = useMemo(() => createOptionMap(categories), [categories]);

  return {
    categories,
    categoryMap,
    categoryMode,
    categoryDraft,
    categoryError,
    ...actions,
  };
}
