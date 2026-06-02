import { normalizeText } from '#/features/chatbot/chatbot.shared.server';
import type { BalanceBucket, BalanceSettings, BalanceSummary } from '#/types/balance';

type BalanceTransactionRecord = {
  nominal: number;
  metodePembayaranName: string;
  tipeName: string;
};

const cashMethodNames = new Set([
  'cash',
  'tunai',
  'uang tunai',
  'kas',
]);

export function classifyBalanceBucket(methodName: string): BalanceBucket {
  return cashMethodNames.has(normalizeText(methodName)) ? 'cash' : 'non_cash';
}

function isIncome(tipeName: string) {
  return normalizeText(tipeName) === 'penghasilan';
}

function isExpense(tipeName: string) {
  return normalizeText(tipeName) === 'pengeluaran';
}

export function createEmptyBalanceSummary(
  settings: BalanceSettings | null = null,
): BalanceSummary {
  const openingCash = settings?.openingCash ?? 0;
  const openingNonCash = settings?.openingNonCash ?? 0;

  return {
    settings,
    isConfigured: Boolean(settings),
    openingCash,
    openingNonCash,
    cashBalance: openingCash,
    nonCashBalance: openingNonCash,
    totalBalance: openingCash + openingNonCash,
    cashIncome: 0,
    cashExpenses: 0,
    nonCashIncome: 0,
    nonCashExpenses: 0,
    kantongs: [],
  };
}

export function buildBalanceSummary(
  settings: BalanceSettings,
  transactions: BalanceTransactionRecord[],
): BalanceSummary {
  const summary = createEmptyBalanceSummary(settings);

  for (const transaction of transactions) {
    const bucket = classifyBalanceBucket(transaction.metodePembayaranName);

    if (bucket === 'cash') {
      if (isIncome(transaction.tipeName)) {
        summary.cashIncome += transaction.nominal;
      }

      if (isExpense(transaction.tipeName)) {
        summary.cashExpenses += transaction.nominal;
      }

      continue;
    }

    if (isIncome(transaction.tipeName)) {
      summary.nonCashIncome += transaction.nominal;
    }

    if (isExpense(transaction.tipeName)) {
      summary.nonCashExpenses += transaction.nominal;
    }
  }

  summary.cashBalance =
    summary.openingCash + summary.cashIncome - summary.cashExpenses;
  summary.nonCashBalance =
    summary.openingNonCash + summary.nonCashIncome - summary.nonCashExpenses;
  summary.totalBalance = summary.cashBalance + summary.nonCashBalance;

  return summary;
}
