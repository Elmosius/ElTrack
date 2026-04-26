import {
  deleteTransaksiById,
  patchTransaksi,
  postTransaksi,
} from '#/features/transaksi/transaksi.functions';
import {
  createDeleteRowPatch,
  getErrorMessage,
  isPersistedTransactionRow,
  validateRowBeforeSave,
} from './transaction-table.store.helpers';
import type { TransactionTableStore } from './transaction-table.store.types';
import type {
  TransactionTableGet,
  TransactionTableSet,
} from './transaction-table.store.shared';

type RowActions = Pick<TransactionTableStore, 'saveRow' | 'handleDeleteRow'>;

export function createTransactionTableRowActions(
  set: TransactionTableSet,
  get: TransactionTableGet,
): RowActions {
  return {
    saveRow: async (rowId) => {
      const row = get().rows.find((item) => item.id === rowId);

      if (!row) {
        return;
      }

      const { payload, error } = validateRowBeforeSave(row);

      if (error) {
        set({ syncError: error });
        return;
      }

      try {
        if (!isPersistedTransactionRow(row.id)) {
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
      if (!isPersistedTransactionRow(rowId)) {
        set((state) => createDeleteRowPatch(state.rows, rowId));
        return;
      }

      try {
        await deleteTransaksiById({
          data: {
            id: rowId,
          },
        });

        set((state) => createDeleteRowPatch(state.rows, rowId));
      } catch (error) {
        set({ syncError: getErrorMessage(error) });
      }
    },
  };
}
