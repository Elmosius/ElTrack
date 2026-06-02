import type { TransaksiRow } from '#/types/transaction-table';
import { getTodayDateString, sanitizeNominal } from './format';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type CreateTransactionRowOptions = {
  tanggal?: string;
  defaultCategoryId?: string;
  defaultWaktuId?: string;
  defaultKantongId?: string;
  defaultTipeId?: string;
};

export function createTransactionRow({
  tanggal = getTodayDateString(),
  defaultCategoryId = '',
  defaultWaktuId = '',
  defaultKantongId = '',
  defaultTipeId = '',
}: CreateTransactionRowOptions): TransaksiRow {
  return {
    id: createId('draft'),
    tanggal,
    namaTransaksi: '',
    waktuId: defaultWaktuId,
    nominal: '',
    kategoriId: defaultCategoryId,
    kantongId: defaultKantongId,
    metodePembayaranId: '',
    catatan: '',
    tipeId: defaultTipeId,
  };
}

export function createCategoryId(): string {
  return createId('cat');
}

export function isDraftTransactionId(id: string): boolean {
  return id.startsWith('draft-');
}

export function toTransaksiMutationInput(row: TransaksiRow) {
  return {
    namaTransaksi: row.namaTransaksi.trim(),
    tanggal: row.tanggal,
    waktu: row.waktuId,
    nominal: Number(sanitizeNominal(row.nominal) || 0),
    kategori: row.kategoriId,
    kantong: row.kantongId || undefined,
    metodePembayaran: row.kantongId ? undefined : row.metodePembayaranId,
    catatan: row.catatan.trim() || undefined,
    tipe: row.tipeId,
  };
}
