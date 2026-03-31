import { serializeDate, stringifyId } from '#/lib/serialization';

export type SerializedTipe = {
  _id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
};

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
