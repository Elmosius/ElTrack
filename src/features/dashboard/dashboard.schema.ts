import { z } from 'zod';

export const dashboardMonthInputSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type DashboardMonthInput = z.infer<typeof dashboardMonthInputSchema>;

export type DashboardTrendPoint = {
  label: string;
  expenses: number;
  income: number;
};

export type DashboardDistributionItem = {
  id: string;
  label: string;
  value: number;
};

export type DashboardRecentTransaction = {
  id: string;
  namaTransaksi: string;
  nominal: number;
  kategoriName: string;
  waktu: string;
  tipeName: string;
  tanggal: string;
};

export type DashboardTopCategory = {
  id: string;
  name: string;
  amount: number;
  previousAmount: number;
  percentageChange: number | null;
  trend: 'up' | 'down' | 'flat' | 'new';
};

export type DashboardHomeData = {
  selectedMonth: string;
  overview: {
    balance: number;
    expenses: number;
    income: number;
    averageDailyExpense: number;
  };
  trend: {
    weekly: DashboardTrendPoint[];
    monthly: DashboardTrendPoint[];
  };
  categoryDistribution: DashboardDistributionItem[];
  paymentMethodDistribution: DashboardDistributionItem[];
  recentTransactions: DashboardRecentTransaction[];
  topCategories: DashboardTopCategory[];
  isEmpty: boolean;
};
