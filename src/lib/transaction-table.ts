import type { TransaksiRow } from '#/types/transaction-table';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sanitizeNominal(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatRupiah(value: string): string {
  const normalized = sanitizeNominal(value);

  if (!normalized) {
    return '';
  }

  return `Rp ${new Intl.NumberFormat('id-ID').format(Number(normalized))}`;
}

export function createTransactionRow(defaultCategoryId: string): TransaksiRow {
  return {
    id: createId('row'),
    namaTransaksi: '',
    waktu: 'Pagi',
    nominal: '',
    kategoriId: defaultCategoryId,
    metodePembayaran: 'Tunai',
    catatan: '',
    tipe: 'Pengeluaran',
  };
}

export function createCategoryId(): string {
  return createId('cat');
}
