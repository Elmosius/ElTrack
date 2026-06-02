import type { KantongSummaryItem } from './kantong';

export type BalanceBucket = 'cash' | 'non_cash';

export type BalanceSettings = {
  _id: string;
  userId: string;
  openingCash: number;
  openingNonCash: number;
  activatedAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BalanceSummary = {
  settings: BalanceSettings | null;
  isConfigured: boolean;
  openingCash: number;
  openingNonCash: number;
  cashBalance: number;
  nonCashBalance: number;
  totalBalance: number;
  cashIncome: number;
  cashExpenses: number;
  nonCashIncome: number;
  nonCashExpenses: number;
  kantongs: KantongSummaryItem[];
};
