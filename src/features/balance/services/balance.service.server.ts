import type { BalanceSummary } from '#/types/balance';
import { serializeBalanceSettingsDoc } from '../mappers';
import type { UpsertBalanceSettingsInput } from '../balance.schema';
import {
  findBalanceSettingsByUserId,
  findBalanceTransaksiByUserIdSince,
  upsertBalanceSettingsByUserId,
} from '../repositories/balance.repository.server';
import {
  buildBalanceSummary,
  createEmptyBalanceSummary,
} from './balance-calculation.server';

type PopulatedNamedRef = {
  nama?: string;
};

function getNamedRefName(value: unknown) {
  if (!value || typeof value === 'string') {
    return '';
  }

  return (value as PopulatedNamedRef).nama ?? '';
}

export async function getBalanceSummaryService(
  userId: string,
): Promise<BalanceSummary> {
  const settingsDoc = await findBalanceSettingsByUserId(userId);

  if (!settingsDoc) {
    return createEmptyBalanceSummary();
  }

  const settings = serializeBalanceSettingsDoc(settingsDoc);
  const transactions = await findBalanceTransaksiByUserIdSince(
    userId,
    new Date(settings.activatedAt),
  );

  return buildBalanceSummary(
    settings,
    transactions.map((transaction) => ({
      nominal: transaction.nominal ?? 0,
      metodePembayaranName: getNamedRefName(transaction.metodePembayaran),
      tipeName: getNamedRefName(transaction.tipe),
    })),
  );
}

export async function upsertBalanceSettingsService(
  userId: string,
  data: UpsertBalanceSettingsInput,
): Promise<BalanceSummary> {
  const settingsDoc = await upsertBalanceSettingsByUserId(userId, data);

  if (!settingsDoc) {
    return createEmptyBalanceSummary();
  }

  return getBalanceSummaryService(userId);
}
