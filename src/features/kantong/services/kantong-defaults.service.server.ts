import { serializeBalanceSettingsDoc } from '#/features/balance/mappers';
import {
  findBalanceSettingsByUserId,
  findBalanceTransaksiByUserIdSince,
} from '#/features/balance/repositories/balance.repository.server';
import {
  buildBalanceSummary,
  createEmptyBalanceSummary,
} from '#/features/balance/services/balance-calculation.server';
import type { SetupDefaultKantongInput } from '../kantong.schema';
import {
  countKantongByUserId,
  insertKantongMany,
} from '../repositories/kantong.repository.server';
import {
  createDefaultKantongInputs,
  getNamedRefName,
  isDuplicateKantongError,
} from './kantong-service-utils.server';

async function getLegacyBalanceSnapshot(userId: string) {
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

async function insertDefaultKantongs(
  userId: string,
  data: SetupDefaultKantongInput,
) {
  try {
    await insertKantongMany(userId, createDefaultKantongInputs(data));
  } catch (error) {
    if (!isDuplicateKantongError(error)) {
      throw error;
    }
  }
}

export async function ensureDefaultKantongsFromLegacyBalance(userId: string) {
  const existingCount = await countKantongByUserId(userId);

  if (existingCount > 0) {
    return;
  }

  const snapshot = await getLegacyBalanceSnapshot(userId);

  if (!snapshot.isConfigured) {
    return;
  }

  await insertDefaultKantongs(userId, {
    openingCash: snapshot.cashBalance,
    openingNonCash: snapshot.nonCashBalance,
  });
}

export async function setupDefaultKantongsIfEmpty(
  userId: string,
  data: SetupDefaultKantongInput,
) {
  const existingCount = await countKantongByUserId(userId);

  if (existingCount === 0) {
    await insertDefaultKantongs(userId, data);
  }
}
