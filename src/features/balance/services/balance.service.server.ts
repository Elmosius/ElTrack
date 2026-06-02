import type { BalanceSummary } from '#/types/balance';
import { getKantongPageDataService } from '#/features/kantong/services/kantong.service.server';
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
  const settings = settingsDoc ? serializeBalanceSettingsDoc(settingsDoc) : null;
  const kantongData = await getKantongPageDataService(userId);

  if (kantongData.isConfigured) {
    const activeKantongs = kantongData.activeItems;

    return {
      settings,
      isConfigured: true,
      openingCash: activeKantongs
        .filter((item) => item.bucket === 'cash')
        .reduce((total, item) => total + item.openingBalance, 0),
      openingNonCash: activeKantongs
        .filter((item) => item.bucket === 'non_cash')
        .reduce((total, item) => total + item.openingBalance, 0),
      cashBalance: kantongData.cashBalance,
      nonCashBalance: kantongData.nonCashBalance,
      totalBalance: kantongData.totalBalance,
      cashIncome: activeKantongs
        .filter((item) => item.bucket === 'cash')
        .reduce((total, item) => total + item.income, 0),
      cashExpenses: activeKantongs
        .filter((item) => item.bucket === 'cash')
        .reduce((total, item) => total + item.expenses, 0),
      nonCashIncome: activeKantongs
        .filter((item) => item.bucket === 'non_cash')
        .reduce((total, item) => total + item.income, 0),
      nonCashExpenses: activeKantongs
        .filter((item) => item.bucket === 'non_cash')
        .reduce((total, item) => total + item.expenses, 0),
      kantongs: kantongData.items,
    };
  }

  if (!settingsDoc) {
    return createEmptyBalanceSummary();
  }

  const legacySettings = serializeBalanceSettingsDoc(settingsDoc);
  const transactions = await findBalanceTransaksiByUserIdSince(
    userId,
    new Date(legacySettings.activatedAt),
  );

  return buildBalanceSummary(
    legacySettings,
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
