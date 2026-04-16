import { z } from 'zod';
export type {
  DashboardDistributionItem,
  DashboardHomeData,
  DashboardRecentTransaction,
  DashboardTopCategory,
  DashboardTrendPoint,
} from '#/types/dashboard';

export const dashboardMonthInputSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type DashboardMonthInput = z.infer<typeof dashboardMonthInputSchema>;
