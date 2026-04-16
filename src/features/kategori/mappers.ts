import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedKategori } from '#/types/transaksi';
export type { SerializedKategori } from '#/types/transaksi';

export function serializeKategoriDoc(item: {
  _id: unknown;
  userId: string;
  nama: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SerializedKategori {
  return {
    _id: stringifyId(item._id),
    userId: item.userId,
    nama: item.nama,
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
  };
}
