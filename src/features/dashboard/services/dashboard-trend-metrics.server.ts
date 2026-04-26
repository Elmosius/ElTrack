import { getMonthEnd, shiftMonth } from '#/lib/dashboard';
import type { DashboardTrendPoint } from '#/types/dashboard';
import type { DashboardTransaksiRecord } from '../mappers';
import {
  isExpenseTransaction,
  isIncomeTransaction,
  sumNominal,
} from './dashboard-overview-metrics.server';

export function buildWeeklyTrendPoints(
  month: string,
  items: DashboardTransaksiRecord[],
): DashboardTrendPoint[] {
  const endDate = Number(getMonthEnd(month).slice(-2));
  const weekCount = Math.ceil(endDate / 7);
  const points = Array.from({ length: weekCount }, (_, index) => ({
    label: `Minggu ${index + 1}`,
    expenses: 0,
    income: 0,
  }));

  items.forEach((item) => {
    const day = Number(item.tanggal.slice(-2));
    const bucketIndex = Math.min(points.length - 1, Math.floor((day - 1) / 7));
    const point = points[bucketIndex];

    if (!point) {
      return;
    }

    if (isExpenseTransaction(item)) {
      point.expenses += item.nominal;
      return;
    }

    if (isIncomeTransaction(item)) {
      point.income += item.nominal;
    }
  });

  return points;
}

export function buildMonthlyTrendPoints(
  selectedMonth: string,
  items: DashboardTransaksiRecord[],
): DashboardTrendPoint[] {
  const months = Array.from({ length: 6 }, (_, index) =>
    shiftMonth(selectedMonth, index - 5),
  );

  return months.map((month) => {
    const monthlyItems = items.filter((item) => item.tanggal.startsWith(month));

    return {
      label: new Intl.DateTimeFormat('id-ID', {
        month: 'short',
      }).format(new Date(`${month}-01T00:00:00`)),
      expenses: sumNominal(monthlyItems.filter(isExpenseTransaction)),
      income: sumNominal(monthlyItems.filter(isIncomeTransaction)),
    };
  });
}
