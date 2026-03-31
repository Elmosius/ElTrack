import { serializeDate, stringifyId } from '#/lib/serialization';

type PopulatedNamedRef = {
  _id: unknown;
  nama?: string;
};

export type DashboardTransaksiRecord = {
  id: string;
  namaTransaksi: string;
  tanggal: string;
  nominal: number;
  waktu: string;
  kategoriId: string;
  kategoriName: string;
  metodePembayaranId: string;
  metodePembayaranName: string;
  tipeId: string;
  tipeName: string;
  createdAt: string | null;
};

function getNamedRefId(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && '_id' in value) {
    return stringifyId((value as PopulatedNamedRef)._id);
  }

  return '';
}

function getNamedRefName(value: unknown) {
  if (!value || typeof value === 'string') {
    return '';
  }

  return (value as PopulatedNamedRef).nama ?? '';
}

export function mapDashboardTransaksiRecord(item: {
  _id: unknown;
  namaTransaksi?: string;
  tanggal?: string;
  nominal?: number;
  waktu?: string | null;
  kategori?: unknown;
  metodePembayaran?: unknown;
  tipe?: unknown;
  createdAt?: Date | string;
}): DashboardTransaksiRecord {
  return {
    id: stringifyId(item._id),
    namaTransaksi: item.namaTransaksi ?? '',
    tanggal: item.tanggal ?? '',
    nominal: item.nominal ?? 0,
    waktu: item.waktu ?? '',
    kategoriId: getNamedRefId(item.kategori),
    kategoriName: getNamedRefName(item.kategori),
    metodePembayaranId: getNamedRefId(item.metodePembayaran),
    metodePembayaranName: getNamedRefName(item.metodePembayaran),
    tipeId: getNamedRefId(item.tipe),
    tipeName: getNamedRefName(item.tipe),
    createdAt: serializeDate(item.createdAt) ?? null,
  };
}
