import type { BalanceBucket } from './balance';

export type SerializedKantong = {
  _id: string;
  userId: string;
  nama: string;
  bucket: BalanceBucket;
  openingBalance: number;
  activatedAt: string;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type KantongSummaryItem = SerializedKantong & {
  currentBalance: number;
  income: number;
  expenses: number;
  isArchived: boolean;
};

export type KantongPageData = {
  items: KantongSummaryItem[];
  activeItems: KantongSummaryItem[];
  archivedItems: KantongSummaryItem[];
  isConfigured: boolean;
  totalBalance: number;
  cashBalance: number;
  nonCashBalance: number;
};
