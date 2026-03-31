import { serializeDate, stringifyId } from '#/lib/serialization';

export type SerializedKategori = {
  _id: string;
  userId: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
};

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
