import { stringifyId } from '#/lib/serialization';
import type { SerializedKantong, KantongPageData } from '#/types/kantong';
import { normalizeText } from '#/features/chatbot/chatbot.shared.server';

type KantongTransactionRecord = {
  nominal: number;
  tipeName: string;
  kantongId: string;
  createdAt: string | Date | null | undefined;
};

function isIncome(tipeName: string) {
  return normalizeText(tipeName) === 'penghasilan';
}

function isExpense(tipeName: string) {
  return normalizeText(tipeName) === 'pengeluaran';
}

function toTime(value: string | Date | null | undefined) {
  if (!value) {
    return 0;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function buildKantongPageData(
  kantongs: SerializedKantong[],
  transactions: KantongTransactionRecord[],
): KantongPageData {
  const transactionGroups = new Map<string, KantongTransactionRecord[]>();

  for (const transaction of transactions) {
    const group = transactionGroups.get(transaction.kantongId) ?? [];
    group.push(transaction);
    transactionGroups.set(transaction.kantongId, group);
  }

  const items = kantongs.map((kantong) => {
    const activatedAt = toTime(kantong.activatedAt);
    const relatedTransactions =
      transactionGroups.get(stringifyId(kantong._id)) ?? [];
    let income = 0;
    let expenses = 0;

    for (const transaction of relatedTransactions) {
      if (toTime(transaction.createdAt) < activatedAt) {
        continue;
      }

      if (isIncome(transaction.tipeName)) {
        income += transaction.nominal;
      }

      if (isExpense(transaction.tipeName)) {
        expenses += transaction.nominal;
      }
    }

    return {
      ...kantong,
      currentBalance: kantong.openingBalance + income - expenses,
      income,
      expenses,
      isArchived: Boolean(kantong.archivedAt),
    };
  });

  const activeItems = items.filter((item) => !item.isArchived);
  const archivedItems = items.filter((item) => item.isArchived);
  const cashBalance = activeItems
    .filter((item) => item.bucket === 'cash')
    .reduce((total, item) => total + item.currentBalance, 0);
  const nonCashBalance = activeItems
    .filter((item) => item.bucket === 'non_cash')
    .reduce((total, item) => total + item.currentBalance, 0);

  return {
    items,
    activeItems,
    archivedItems,
    isConfigured: items.length > 0,
    totalBalance: cashBalance + nonCashBalance,
    cashBalance,
    nonCashBalance,
  };
}
