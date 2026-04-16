import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedMetodePembayaran } from '#/types/transaksi';
export type { SerializedMetodePembayaran } from '#/types/transaksi';

export function serializeMetodePembayaranDoc(item: {
  _id: unknown;
  nama: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}) {
  return {
    _id: stringifyId(item._id),
    nama: item.nama,
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
  } satisfies SerializedMetodePembayaran;
}
