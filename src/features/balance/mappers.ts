import { serializeDate, stringifyId } from '#/lib/serialization';
import type { BalanceSettings } from '#/types/balance';

export function serializeBalanceSettingsDoc(item: {
  _id: unknown;
  userId: string;
  openingCash?: number | null;
  openingNonCash?: number | null;
  activatedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): BalanceSettings {
  return {
    _id: stringifyId(item._id),
    userId: item.userId,
    openingCash: item.openingCash ?? 0,
    openingNonCash: item.openingNonCash ?? 0,
    activatedAt: serializeDate(item.activatedAt) ?? new Date().toISOString(),
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
  };
}
