import type { Kategori, SelectOption, TransactionTableData, TransaksiRow } from '#/types/transaction-table';

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

type NamedDoc = {
  _id: unknown;
  nama: string;
};

type RawTransaksiDoc = {
  _id: unknown;
  namaTransaksi?: string;
  tanggal?: string | null;
  createdAt?: string | Date;
  waktu?: NamedDoc | string | null;
  nominal?: number | null;
  kategori?: NamedDoc | string | null;
  metodePembayaran?: NamedDoc | string | null;
  catatan?: string | null;
  tipe?: NamedDoc | string | null;
};

function getNamedDocId(value: NamedDoc | string | null | undefined): string {
  if (!value) {
    return '';
  }

  return typeof value === 'string' ? value : String(value._id);
}

function toIsoDateFromUnknown(value: string | Date | null | undefined): string {
  if (!value) {
    return getTodayDateString();
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

export function mapKategoriDocToOption(doc: NamedDoc): Kategori {
  return {
    id: String(doc._id),
    name: doc.nama,
  };
}

export function mapNamedDocToOption(doc: NamedDoc): SelectOption {
  return {
    id: String(doc._id),
    name: doc.nama,
  };
}

export function mapTransaksiDocToRow(doc: RawTransaksiDoc): TransaksiRow {
  return {
    id: String(doc._id),
    tanggal: doc.tanggal || toIsoDateFromUnknown(doc.createdAt),
    namaTransaksi: doc.namaTransaksi ?? '',
    waktuId: getNamedDocId(doc.waktu),
    nominal: doc.nominal != null ? String(doc.nominal) : '',
    kategoriId: getNamedDocId(doc.kategori),
    metodePembayaranId: getNamedDocId(doc.metodePembayaran),
    catatan: doc.catatan ?? '',
    tipeId: getNamedDocId(doc.tipe),
  };
}

type BuildTransactionTableDataArgs = {
  listWaktu: NamedDoc[];
  listTipe: NamedDoc[];
  listKategori: NamedDoc[];
  listMetodePembayaran: NamedDoc[];
  listTransaksi: RawTransaksiDoc[];
};

export function buildTransactionTableData({
  listWaktu,
  listTipe,
  listKategori,
  listMetodePembayaran,
  listTransaksi,
}: BuildTransactionTableDataArgs): TransactionTableData {
  return {
    rows: listTransaksi.map(mapTransaksiDocToRow),
    categories: listKategori.map(mapKategoriDocToOption),
    waktuOptions: listWaktu.map(mapNamedDocToOption),
    metodePembayaranOptions: listMetodePembayaran.map(mapNamedDocToOption),
    tipeOptions: listTipe.map(mapNamedDocToOption),
  };
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

type CreateTransactionRowOptions = {
  tanggal?: string;
  defaultCategoryId?: string;
  defaultWaktuId?: string;
  defaultMetodePembayaranId?: string;
  defaultTipeId?: string;
};

export function createTransactionRow({
  tanggal = getTodayDateString(),
  defaultCategoryId = '',
  defaultWaktuId = '',
  defaultMetodePembayaranId = '',
  defaultTipeId = '',
}: CreateTransactionRowOptions): TransaksiRow {
  return {
    id: createId('draft'),
    tanggal,
    namaTransaksi: '',
    waktuId: defaultWaktuId,
    nominal: '',
    kategoriId: defaultCategoryId,
    metodePembayaranId: defaultMetodePembayaranId,
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
    metodePembayaran: row.metodePembayaranId,
    catatan: row.catatan.trim() || undefined,
    tipe: row.tipeId,
  };
}
