import type {
  Kategori,
  SelectOption,
  TransactionTableData,
  TransaksiRow,
} from '#/types/transaction-table';
import { getTodayDateString, waktuOptionsStatic } from './format';

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

type BuildTransactionTableDataArgs = {
  listTipe: NamedDoc[];
  listKategori: NamedDoc[];
  listMetodePembayaran: NamedDoc[];
  listTransaksi: RawTransaksiDoc[];
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

export function buildTransactionTableData({
  listTipe,
  listKategori,
  listMetodePembayaran,
  listTransaksi,
}: BuildTransactionTableDataArgs): TransactionTableData {
  return {
    rows: listTransaksi.map(mapTransaksiDocToRow),
    categories: listKategori.map(mapKategoriDocToOption),
    waktuOptions: waktuOptionsStatic.map((name) => ({ id: name, name })),
    metodePembayaranOptions: listMetodePembayaran.map(mapNamedDocToOption),
    tipeOptions: listTipe.map(mapNamedDocToOption),
  };
}
