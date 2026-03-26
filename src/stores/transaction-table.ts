import { initialCategories, initialRows } from '#/const/transaction-table';
import { createCategoryId, createTransactionRow, getTodayDateString, sanitizeNominal } from '#/lib/transaction-table';
import type { CategoryEditorMode, Kategori, TransaksiRow } from '#/types/transaction-table';
import { create } from 'zustand';

type TransactionTableStore = {
  rows: TransaksiRow[];
  selectedDate: string;
  categories: Kategori[];
  categoryMode: CategoryEditorMode;
  categoryDraft: string;
  editingCategoryId: string | null;
  categoryError: string;
  deleteCategoryId: string | null;
  isDeleteDialogOpen: boolean;

  setCategoryDraft: (value: string) => void;
  setSelectedDate: (value: string) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  updateRow: (rowId: string, patch: Partial<TransaksiRow>) => void;
  handleNominalChange: (rowId: string, value: string) => void;
  handleAddRow: () => void;
  handleDeleteRow: (rowId: string) => void;
  handleAddCategory: () => void;
  handleEditCategory: (category: Kategori) => void;
  handleSaveCategory: () => void;
  resetCategoryEditor: () => void;
  requestDeleteCategory: (category: Kategori) => void;
  confirmDeleteCategory: () => void;
  clearDeleteTarget: () => void;
};

export const useTransactionTableStore = create<TransactionTableStore>((set, get) => ({
  rows: initialRows,
  selectedDate: getTodayDateString(),
  categories: initialCategories,
  categoryMode: 'idle',
  categoryDraft: '',
  editingCategoryId: null,
  categoryError: '',
  deleteCategoryId: null,
  isDeleteDialogOpen: false,

  setCategoryDraft: (value) => set({ categoryDraft: value }),
  setSelectedDate: (value) => set({ selectedDate: value }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),

  updateRow: (rowId, patch) =>
    set((state) => ({
      rows: state.rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    })),

  handleNominalChange: (rowId, value) => {
    get().updateRow(rowId, { nominal: sanitizeNominal(value) });
  },

  handleAddRow: () =>
    set((state) => {
      const fallbackCategoryId = state.categories[0]?.id ?? 'uncategorized';
      return {
        rows: [...state.rows, createTransactionRow(fallbackCategoryId, state.selectedDate)],
      };
    }),

  handleDeleteRow: (rowId) =>
    set((state) => ({
      rows: state.rows.filter((row) => row.id !== rowId),
    })),

  handleAddCategory: () =>
    set({
      categoryMode: 'add',
      categoryDraft: '',
      editingCategoryId: null,
      categoryError: '',
    }),

  handleEditCategory: (category) =>
    set({
      categoryMode: 'edit',
      categoryDraft: category.name,
      editingCategoryId: category.id,
      categoryError: '',
    }),

  handleSaveCategory: () => {
    const { categoryDraft, categories, editingCategoryId, categoryMode } = get();
    const normalized = categoryDraft.trim();

    if (!normalized) {
      set({ categoryError: 'Nama kategori tidak boleh kosong.' });
      return;
    }

    const duplicated = categories.some((category) => category.name.toLowerCase() === normalized.toLowerCase() && category.id !== editingCategoryId);

    if (duplicated) {
      set({ categoryError: 'Nama kategori sudah ada.' });
      return;
    }

    if (categoryMode === 'add') {
      set((state) => ({
        categories: [...state.categories, { id: createCategoryId(), name: normalized }],
        categoryMode: 'idle',
        categoryDraft: '',
        editingCategoryId: null,
        categoryError: '',
      }));
      return;
    }

    if (categoryMode === 'edit' && editingCategoryId) {
      set((state) => ({
        categories: state.categories.map((category) => (category.id === editingCategoryId ? { ...category, name: normalized } : category)),
        categoryMode: 'idle',
        categoryDraft: '',
        editingCategoryId: null,
        categoryError: '',
      }));
    }
  },

  resetCategoryEditor: () =>
    set({
      categoryMode: 'idle',
      categoryDraft: '',
      editingCategoryId: null,
      categoryError: '',
    }),

  requestDeleteCategory: (category) => {
    const isUsed = get().rows.some((row) => row.kategoriId === category.id);

    if (isUsed) {
      set({
        categoryError: 'Kategori ini masih dipakai transaksi, jadi belum bisa dihapus.',
      });
      return;
    }

    set({
      categoryError: '',
      deleteCategoryId: category.id,
      isDeleteDialogOpen: true,
    });
  },

  confirmDeleteCategory: () => {
    const { deleteCategoryId } = get();

    if (!deleteCategoryId) {
      return;
    }

    set((state) => ({
      categories: state.categories.filter((category) => category.id !== deleteCategoryId),
      deleteCategoryId: null,
      categoryMode: 'idle',
      categoryDraft: '',
      editingCategoryId: null,
      categoryError: '',
    }));
  },

  clearDeleteTarget: () => set({ deleteCategoryId: null }),
}));
