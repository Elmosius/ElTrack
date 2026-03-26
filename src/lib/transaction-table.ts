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

export function getTodayDateString(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function formatTransactionDate(value: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function createTransactionRow(defaultCategoryId: string, tanggal = getTodayDateString()): TransaksiRow {
  return {
    id: createId('row'),
    tanggal,
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
