import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedTipe } from '#/types/transaksi';
export type { SerializedTipe } from '#/types/transaksi';

export function serializeTipeDoc(item: {
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
  } satisfies SerializedTipe;
}
