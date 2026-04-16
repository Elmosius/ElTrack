import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedNamedRef, SerializedTransaksi } from '#/types/transaksi';
export type { SerializedNamedRef, SerializedTransaksi } from '#/types/transaksi';

export function serializeNamedRef(
  value: unknown,
): string | SerializedNamedRef | null | undefined {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && '_id' in value) {
    const record = value as {
      _id: unknown;
      nama?: string;
      createdAt?: Date | string;
      updatedAt?: Date | string;
    };

    return {
      _id: stringifyId(record._id),
      nama: record.nama ?? '',
      createdAt: serializeDate(record.createdAt) ?? undefined,
      updatedAt: serializeDate(record.updatedAt) ?? undefined,
    };
  }

  return stringifyId(value);
}

export function serializeTransaksiDoc(item: {
  _id: unknown;
  userId: string;
  namaTransaksi: string;
  tanggal: string;
  nominal: number;
  catatan?: string;
  waktu?: unknown;
  kategori?: unknown;
  metodePembayaran?: unknown;
  tipe?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SerializedTransaksi {
  return {
    _id: stringifyId(item._id),
    userId: item.userId,
    namaTransaksi: item.namaTransaksi,
    tanggal: item.tanggal,
    nominal: item.nominal,
    catatan: item.catatan,
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
    waktu: item.waktu == null ? item.waktu : stringifyId(item.waktu),
    kategori: serializeNamedRef(item.kategori),
    metodePembayaran: serializeNamedRef(item.metodePembayaran),
    tipe: serializeNamedRef(item.tipe),
  };
}
