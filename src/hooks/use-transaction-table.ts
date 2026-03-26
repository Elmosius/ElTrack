import { useTransactionTableStore } from '#/stores/transaction-table';
import { useMemo } from 'react';

export function useTransactionTable() {
  const rows = useTransactionTableStore((state) => state.rows);
  const categories = useTransactionTableStore((state) => state.categories);
  const categoryMode = useTransactionTableStore((state) => state.categoryMode);
  const categoryDraft = useTransactionTableStore((state) => state.categoryDraft);
  const categoryError = useTransactionTableStore((state) => state.categoryError);
  const deleteCategoryId = useTransactionTableStore((state) => state.deleteCategoryId);
  const isDeleteDialogOpen = useTransactionTableStore((state) => state.isDeleteDialogOpen);

  const setCategoryDraft = useTransactionTableStore((state) => state.setCategoryDraft);
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

  const selectedCategory = categories.find((category) => category.id === deleteCategoryId);

  return {
    state: {
      rows,
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
