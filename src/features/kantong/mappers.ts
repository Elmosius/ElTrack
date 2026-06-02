import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedKantong } from '#/types/kantong';

export function serializeKantongDoc(item: {
  _id: unknown;
  userId: string;
  nama: string;
  bucket: SerializedKantong['bucket'];
  openingBalance: number;
  activatedAt?: Date | string;
  archivedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SerializedKantong {
  return {
    _id: stringifyId(item._id),
    userId: item.userId,
    nama: item.nama,
    bucket: item.bucket,
    openingBalance: item.openingBalance,
    activatedAt: serializeDate(item.activatedAt) ?? new Date().toISOString(),
    archivedAt: serializeDate(item.archivedAt) ?? null,
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
  };
}
