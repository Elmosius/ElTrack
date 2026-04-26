import {
  deleteKategoriById,
  patchKategori,
  postKategori,
} from '#/features/kategori/kategori.functions';
import {
  createDeleteCategorySuccessState,
  createResetCategoryEditorState,
  getErrorMessage,
  hasDuplicateCategoryName,
} from './transaction-table.store.helpers';
import type { TransactionTableStore } from './transaction-table.store.types';
import type {
  TransactionTableGet,
  TransactionTableSet,
} from './transaction-table.store.shared';

type CategoryActions = Pick<
  TransactionTableStore,
  'handleSaveCategory' | 'confirmDeleteCategory'
>;

export function createTransactionTableCategoryActions(
  set: TransactionTableSet,
  get: TransactionTableGet,
): CategoryActions {
  return {
    handleSaveCategory: async () => {
      const { categoryDraft, categories, editingCategoryId, categoryMode } =
        get();
      const normalized = categoryDraft.trim();

      if (!normalized) {
        set({ categoryError: 'Nama kategori tidak boleh kosong.' });
        return;
      }

      if (
        hasDuplicateCategoryName(categories, normalized, editingCategoryId)
      ) {
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
            ...createResetCategoryEditorState(),
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
            ...createResetCategoryEditorState(),
          }));
        }
      } catch (error) {
        set({ categoryError: getErrorMessage(error) });
      }
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

        set((state) =>
          createDeleteCategorySuccessState(
            state.categories,
            deleteCategoryId,
          ),
        );
      } catch (error) {
        set({ categoryError: getErrorMessage(error) });
      }
    },
  };
}
