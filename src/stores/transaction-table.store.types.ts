import type {
  CategoryEditorMode,
  Kategori,
  SelectOption,
  TransactionTableData,
  TransaksiRow,
} from '#/types/transaction-table';

export type TransactionTableStore = {
  rows: TransaksiRow[];
  selectedDate: string;
  categories: Kategori[];
  waktuOptions: SelectOption[];
  metodePembayaranOptions: SelectOption[];
  tipeOptions: SelectOption[];
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
