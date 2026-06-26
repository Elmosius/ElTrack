import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedLangganan } from '#/types/langganan';

export function serializeLanggananDoc(item: {
  _id: unknown;
  userId: string;
  nama: string;
  nominal: number;
  frequency: 'bulanan' | 'tahunan';
  nextDueDate: string;
  reminderDays?: number;
  kantong: unknown;
  status: 'aktif' | 'dijeda';
  catatan?: string;
  lastPaidAt?: string;
  lastTransactionId?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SerializedLangganan {
  return {
    _id: stringifyId(item._id),
    userId: item.userId,
    nama: item.nama,
    nominal: item.nominal,
    frequency: item.frequency,
    nextDueDate: item.nextDueDate,
    reminderDays: item.reminderDays ?? 3,
    kantong: stringifyId(item.kantong),
    status: item.status,
    catatan: item.catatan || undefined,
    lastPaidAt: item.lastPaidAt || undefined,
    lastTransactionId: item.lastTransactionId
      ? stringifyId(item.lastTransactionId)
      : undefined,
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
  };
}
