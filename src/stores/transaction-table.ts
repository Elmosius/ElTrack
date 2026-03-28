import { deleteKategoriById, patchKategori, postKategori } from '#/features/kategori/kategori.functions';
import { deleteTransaksiById, patchTransaksi, postTransaksi } from '#/features/transaksi/transaksi.functions';
import { createTransactionRow, getTodayDateString, isDraftTransactionId, sanitizeNominal, toTransaksiMutationInput } from '#/lib/transaction-table';
import type { CategoryEditorMode, Kategori, TransactionTableData, TransaksiRow } from '#/types/transaction-table';
import { create } from 'zustand';

type TransactionTableStore = {
  rows: TransaksiRow[];
  selectedDate: string;
  categories: Kategori[];
  waktuOptions: string[];
  metodePembayaranOptions: string[];
  tipeOptions: string[];
  categoryMode: CategoryEditorMode;
  categoryDraft: string;
  editingCategoryId: string | null;
  categoryError: string;
  syncError: string;
  deleteCategoryId: string | null;
  isDeleteDialogOpen: boolean;

  hydrateData: (data: TransactionTableData) => void;
  setCategoryDraft: (value: string) => void;
  setSelectedDate: (value: string) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  updateRow: (rowId: string, patch: Partial<TransaksiRow>) => void;
  handleNominalChange: (rowId: string, value: string) => void;
  handleAddRow: () => void;
  saveRow: (rowId: string) => Promise<void>;
  handleDeleteRow: (rowId: string) => Promise<void>;
  handleAddCategory: () => void;
  handleEditCategory: (category: Kategori) => void;
  handleSaveCategory: () => Promise<void>;
  resetCategoryEditor: () => void;
  requestDeleteCategory: (category: Kategori) => void;
  confirmDeleteCategory: () => Promise<void>;
  clearDeleteTarget: () => void;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Coba lagi.';
}

export const useTransactionTableStore = create<TransactionTableStore>((set, get) => ({
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

  hydrateData: (data) =>
    set((state) => ({
      rows: data.rows,
      categories: data.categories,
      waktuOptions: data.waktuOptions,
      metodePembayaranOptions: data.metodePembayaranOptions,
      tipeOptions: data.tipeOptions,
      selectedDate: state.selectedDate || getTodayDateString(),
      categoryError: '',
      syncError: '',
    })),

  setCategoryDraft: (value) => set({ categoryDraft: value }),
  setSelectedDate: (value) => set({ selectedDate: value }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),

  updateRow: (rowId, patch) =>
    set((state) => ({
      syncError: '',
      rows: state.rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    })),

  handleNominalChange: (rowId, value) => {
    get().updateRow(rowId, { nominal: sanitizeNominal(value) });
  },

  handleAddRow: () =>
    set((state) => {
      const fallbackCategoryId = state.categories[0]?.id ?? '';
      return {
        syncError: '',
        rows: [
          ...state.rows,
          createTransactionRow({
            tanggal: state.selectedDate,
            defaultCategoryId: fallbackCategoryId,
            defaultWaktu: state.waktuOptions[0] ?? '',
            defaultMetodePembayaran: state.metodePembayaranOptions[0] ?? '',
            defaultTipe: state.tipeOptions[0] ?? '',
          }),
        ],
      };
    }),

  saveRow: async (rowId) => {
    const row = get().rows.find((item) => item.id === rowId);

    if (!row) {
      return;
    }

    const payload = toTransaksiMutationInput(row);

    if (!payload.namaTransaksi) {
      set({ syncError: 'Nama transaksi wajib diisi sebelum disimpan.' });
      return;
    }

    if (!payload.kategori) {
      set({ syncError: 'Kategori wajib dipilih sebelum disimpan.' });
      return;
    }

    try {
      if (isDraftTransactionId(row.id)) {
        const created = await postTransaksi({ data: payload });

        set((state) => ({
          syncError: '',
          rows: state.rows.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  id: String((created as { _id: unknown })._id),
                }
              : item,
          ),
        }));

        return;
      }

      await patchTransaksi({
        data: {
          id: row.id,
          ...payload,
        },
      });

      set({ syncError: '' });
    } catch (error) {
      set({ syncError: getErrorMessage(error) });
    }
  },

  handleDeleteRow: async (rowId) => {
    if (isDraftTransactionId(rowId)) {
      set((state) => ({
        syncError: '',
        rows: state.rows.filter((row) => row.id !== rowId),
      }));
      return;
    }

    try {
      await deleteTransaksiById({
        data: {
          id: rowId,
        },
      });

      set((state) => ({
        syncError: '',
        rows: state.rows.filter((row) => row.id !== rowId),
      }));
    } catch (error) {
      set({ syncError: getErrorMessage(error) });
    }
  },

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

  handleSaveCategory: async () => {
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

    try {
      if (categoryMode === 'add') {
        const created = await postKategori({
          data: {
            nama: normalized,
          },
        });

        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: String((created as { _id: unknown })._id),
              name: (created as { nama: string }).nama,
            },
          ],
          categoryMode: 'idle',
          categoryDraft: '',
          editingCategoryId: null,
          categoryError: '',
        }));
        return;
      }

      if (categoryMode === 'edit' && editingCategoryId) {
        const updated = await patchKategori({
          data: {
            id: editingCategoryId,
            nama: normalized,
          },
        });

        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === editingCategoryId
              ? { ...category, name: (updated as { nama: string }).nama }
              : category,
          ),
          categoryMode: 'idle',
          categoryDraft: '',
          editingCategoryId: null,
          categoryError: '',
        }));
      }
    } catch (error) {
      set({ categoryError: getErrorMessage(error) });
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

  confirmDeleteCategory: async () => {
    const { deleteCategoryId } = get();

    if (!deleteCategoryId) {
      return;
    }

    try {
      await deleteKategoriById({
        data: {
          id: deleteCategoryId,
        },
      });

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== deleteCategoryId),
        deleteCategoryId: null,
        isDeleteDialogOpen: false,
        categoryMode: 'idle',
        categoryDraft: '',
        editingCategoryId: null,
        categoryError: '',
      }));
    } catch (error) {
      set({ categoryError: getErrorMessage(error) });
    }
  },

  clearDeleteTarget: () => set({ deleteCategoryId: null }),
}));
