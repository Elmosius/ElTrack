import { useTransactionTableStore } from '#/stores/transaction-table';
import type { SelectOption, TransactionTableData } from '#/types/transaction-table';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

function createOptionMap(options: SelectOption[]) {
  return new Map(options.map((option) => [option.id, option.name]));
}

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
  const syncError = useTransactionTableStore((state) => state.syncError);
  const categoryMode = useTransactionTableStore((state) => state.categoryMode);
  const categoryDraft = useTransactionTableStore((state) => state.categoryDraft);
  const categoryError = useTransactionTableStore((state) => state.categoryError);
  const deleteCategoryId = useTransactionTableStore((state) => state.deleteCategoryId);
  const isDeleteDialogOpen = useTransactionTableStore((state) => state.isDeleteDialogOpen);

  const setCategoryDraft = useTransactionTableStore((state) => state.setCategoryDraft);
  const setSelectedDate = useTransactionTableStore((state) => state.setSelectedDate);
  const setIsDeleteDialogOpen = useTransactionTableStore((state) => state.setIsDeleteDialogOpen);
  const updateRow = useTransactionTableStore((state) => state.updateRow);
  const handleNominalChange = useTransactionTableStore((state) => state.handleNominalChange);
  const handleAddRow = useTransactionTableStore((state) => state.handleAddRow);
  const handleDeleteRow = useTransactionTableStore((state) => state.handleDeleteRow);
  const handleAddCategory = useTransactionTableStore((state) => state.handleAddCategory);
  const handleEditCategory = useTransactionTableStore((state) => state.handleEditCategory);
  const handleSaveCategory = useTransactionTableStore((state) => state.handleSaveCategory);
  const resetCategoryEditor = useTransactionTableStore((state) => state.resetCategoryEditor);
  const requestDeleteCategory = useTransactionTableStore((state) => state.requestDeleteCategory);
  const confirmDeleteCategory = useTransactionTableStore((state) => state.confirmDeleteCategory);
  const clearDeleteTarget = useTransactionTableStore((state) => state.clearDeleteTarget);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const filteredRows = useMemo(() => rows.filter((row) => row.tanggal === selectedDate), [rows, selectedDate]);

  const selectedCategory = categories.find((category) => category.id === deleteCategoryId);

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
    actions: {
      setCategoryDraft,
      setSelectedDate,
      setIsDeleteDialogOpen,
      updateRow,
      handleNominalChange,
      handleAddRow,
      handleDeleteRow,
      handleAddCategory,
      handleEditCategory,
      handleSaveCategory,
      resetCategoryEditor,
      requestDeleteCategory,
      confirmDeleteCategory,
      clearDeleteTarget,
    },
  };
}

export function useTransactionTableHeader() {
  return useTransactionTableStore(
    useShallow((state) => ({
      selectedDate: state.selectedDate,
      setSelectedDate: state.setSelectedDate,
    })),
  );
}

export function useTransactionTableContent() {
  return useTransactionTableStore(
    useShallow((state) => ({
      handleAddRow: state.handleAddRow,
      syncError: state.syncError,
    })),
  );
}

export function useTransactionTableBody() {
  const rows = useTransactionTableStore((state) => state.rows);
  const selectedDate = useTransactionTableStore((state) => state.selectedDate);
  const waktuOptions = useTransactionTableStore((state) => state.waktuOptions);
  const metodePembayaranOptions = useTransactionTableStore((state) => state.metodePembayaranOptions);
  const tipeOptions = useTransactionTableStore((state) => state.tipeOptions);
  const updateRow = useTransactionTableStore((state) => state.updateRow);
  const handleNominalChange = useTransactionTableStore((state) => state.handleNominalChange);
  const handleDeleteRow = useTransactionTableStore((state) => state.handleDeleteRow);
  const saveRow = useTransactionTableStore((state) => state.saveRow);

  const filteredRows = useMemo(() => rows.filter((row) => row.tanggal === selectedDate), [rows, selectedDate]);
  const waktuMap = useMemo(() => createOptionMap(waktuOptions), [waktuOptions]);
  const metodePembayaranMap = useMemo(() => createOptionMap(metodePembayaranOptions), [metodePembayaranOptions]);
  const tipeMap = useMemo(() => createOptionMap(tipeOptions), [tipeOptions]);

  return {
    filteredRows,
    waktuOptions,
    metodePembayaranOptions,
    tipeOptions,
    waktuMap,
    metodePembayaranMap,
    tipeMap,
    updateRow,
    handleNominalChange,
    handleDeleteRow,
    saveRow,
  };
}

export function useTransactionTableDeleteDialog() {
  const categories = useTransactionTableStore((state) => state.categories);
  const deleteCategoryId = useTransactionTableStore((state) => state.deleteCategoryId);

  const dialogState = useTransactionTableStore(
    useShallow((state) => ({
      isDeleteDialogOpen: state.isDeleteDialogOpen,
      setIsDeleteDialogOpen: state.setIsDeleteDialogOpen,
      clearDeleteTarget: state.clearDeleteTarget,
      confirmDeleteCategory: state.confirmDeleteCategory,
    })),
  );

  const selectedCategory = useMemo(() => categories.find((category) => category.id === deleteCategoryId), [categories, deleteCategoryId]);

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
    useShallow((state) => ({
      updateRow: state.updateRow,
      saveRow: state.saveRow,
      handleAddCategory: state.handleAddCategory,
      handleEditCategory: state.handleEditCategory,
      handleSaveCategory: state.handleSaveCategory,
      requestDeleteCategory: state.requestDeleteCategory,
      resetCategoryEditor: state.resetCategoryEditor,
      setCategoryDraft: state.setCategoryDraft,
    })),
  );

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  return {
    categories,
    categoryMap,
    categoryMode,
    categoryDraft,
    categoryError,
    ...actions,
  };
}
