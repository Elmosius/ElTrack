import { useTransactionTableStore } from '#/stores/transaction-table';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function useTransactionTable() {
  const rows = useTransactionTableStore((state) => state.rows);
  const selectedDate = useTransactionTableStore((state) => state.selectedDate);
  const categories = useTransactionTableStore((state) => state.categories);
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
    })),
  );
}

export function useTransactionTableBody() {
  const rows = useTransactionTableStore((state) => state.rows);
  const selectedDate = useTransactionTableStore((state) => state.selectedDate);
  const updateRow = useTransactionTableStore((state) => state.updateRow);
  const handleNominalChange = useTransactionTableStore((state) => state.handleNominalChange);
  const handleDeleteRow = useTransactionTableStore((state) => state.handleDeleteRow);

  const filteredRows = useMemo(() => rows.filter((row) => row.tanggal === selectedDate), [rows, selectedDate]);

  return {
    filteredRows,
    updateRow,
    handleNominalChange,
    handleDeleteRow,
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
