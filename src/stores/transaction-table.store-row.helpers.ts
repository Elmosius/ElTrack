import {
  isDraftTransactionId,
  toTransaksiMutationInput,
} from '#/lib/transaction-table';
import type { TransaksiRow } from '#/types/transaction-table';

export function validateRowBeforeSave(row: TransaksiRow) {
  const payload = toTransaksiMutationInput(row);

  if (!payload.namaTransaksi) {
    return {
      payload,
      error: 'Nama transaksi wajib diisi sebelum disimpan.',
    };
  }

  if (!payload.kategori) {
    return {
      payload,
      error: 'Kategori wajib dipilih sebelum disimpan.',
    };
  }

  if (!payload.waktu || (!payload.kantong && !payload.metodePembayaran) || !payload.tipe) {
    return {
      payload,
      error: 'Waktu, kantong, dan tipe wajib dipilih sebelum disimpan.',
    };
  }

  return {
    payload,
    error: null,
  };
}

export function createDeleteRowPatch(rows: TransaksiRow[], rowId: string) {
  return {
    syncError: '',
    rows: rows.filter((row) => row.id !== rowId),
  };
}

export function isPersistedTransactionRow(rowId: string) {
  return !isDraftTransactionId(rowId);
}
