import {
  getMonthEnd,
  getMonthStart,
  normalizeDashboardMonth,
  shiftMonth,
} from '#/lib/dashboard';
import type { DashboardMonthInput } from '../dashboard.schema';
import type { DashboardHomeData } from '#/types/dashboard';
import { getBalanceSummary } from '#/features/balance/balance.server';
import { mapDashboardTransaksiRecord } from '../mappers';
import { findDashboardTransaksiByUserIdAndDateRange } from '../repositories/dashboard.repository.server';
import {
  buildDashboardOverview,
  buildDistributionItems,
  buildMonthlyTrendPoints,
  buildRecentTransactions,
  buildTopCategories,
  buildWeeklyTrendPoints,
} from './dashboard-metrics.server';

export async function getDashboardHomeDataService(
  userId: string,
  input: DashboardMonthInput,
): Promise<DashboardHomeData> {
  const selectedMonth = normalizeDashboardMonth(input.month);
  const selectedMonthStart = getMonthStart(selectedMonth);
  const selectedMonthEnd = getMonthEnd(selectedMonth);
  const previousMonth = shiftMonth(selectedMonth, -1);
  const earliestTrendMonth = shiftMonth(selectedMonth, -5);

  const [rawItems, balance] = await Promise.all([
    findDashboardTransaksiByUserIdAndDateRange(
      userId,
      getMonthStart(earliestTrendMonth),
      selectedMonthEnd,
    ),
    getBalanceSummary(userId),
  ]);
  const items = rawItems.map((item) => mapDashboardTransaksiRecord(item));
  const selectedItems = items.filter(
    (item) => item.tanggal >= selectedMonthStart && item.tanggal <= selectedMonthEnd,
  );
  const previousItems = items.filter((item) =>
    item.tanggal.startsWith(previousMonth),
  );

  return {
    selectedMonth,
    balance,
    overview: buildDashboardOverview(selectedMonth, selectedItems),
    trend: {
      weekly: buildWeeklyTrendPoints(selectedMonth, selectedItems),
      monthly: buildMonthlyTrendPoints(selectedMonth, items),
    },
    categoryDistribution: buildDistributionItems(selectedItems, 'kategori'),
    paymentMethodDistribution: buildDistributionItems(
      selectedItems,
      'metodePembayaran',
    ),
    recentTransactions: buildRecentTransactions(selectedItems),
    topCategories: buildTopCategories(selectedItems, previousItems),
    isEmpty: selectedItems.length === 0,
  };
}
