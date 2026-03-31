import {
  getAverageExpenseDayDivisor,
  getMonthEnd,
  getMonthStart,
  getPercentageTrendLabel,
  normalizeDashboardMonth,
  shiftMonth,
} from '#/lib/dashboard';
import type { DashboardHomeData, DashboardMonthInput, DashboardTrendPoint } from '../dashboard.schema';
import { mapDashboardTransaksiRecord, type DashboardTransaksiRecord } from '../mappers';
import { findDashboardTransaksiByUserIdAndDateRange } from '../repositories/dashboard.repository.server';

function isExpenseTransaction(item: DashboardTransaksiRecord) {
  return item.tipeName.trim().toLowerCase() === 'pengeluaran';
}

function isIncomeTransaction(item: DashboardTransaksiRecord) {
  return item.tipeName.trim().toLowerCase() === 'penghasilan';
}

function sumNominal(list: DashboardTransaksiRecord[]) {
  return list.reduce((total, item) => total + item.nominal, 0);
}

function buildWeeklyTrendPoints(
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

function buildMonthlyTrendPoints(
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

function buildDistributionItems(
  items: DashboardTransaksiRecord[],
  key: 'kategori' | 'metodePembayaran',
) {
  const distributionMap = new Map<
    string,
    { id: string; label: string; value: number }
  >();

  items.filter(isExpenseTransaction).forEach((item) => {
    const id = key === 'kategori' ? item.kategoriId : item.metodePembayaranId;
    const label =
      key === 'kategori' ? item.kategoriName : item.metodePembayaranName;

    if (!id || !label) {
      return;
    }

    const currentItem = distributionMap.get(id);

    if (currentItem) {
      currentItem.value += item.nominal;
      return;
    }

    distributionMap.set(id, {
      id,
      label,
      value: item.nominal,
    });
  });

  return [...distributionMap.values()].sort((a, b) => b.value - a.value);
}

function buildRecentTransactions(items: DashboardTransaksiRecord[]) {
  return [...items]
    .sort((left, right) => {
      const leftDate = `${left.tanggal}-${left.createdAt ?? ''}`;
      const rightDate = `${right.tanggal}-${right.createdAt ?? ''}`;
      return rightDate.localeCompare(leftDate);
    })
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      namaTransaksi: item.namaTransaksi,
      nominal: item.nominal,
      kategoriName: item.kategoriName || '-',
      waktu: item.waktu || '-',
      tipeName: item.tipeName || '-',
      tanggal: item.tanggal,
    }));
}

function buildTopCategories(
  currentItems: DashboardTransaksiRecord[],
  previousItems: DashboardTransaksiRecord[],
) {
  const currentMap = new Map<
    string,
    { id: string; name: string; amount: number }
  >();
  const previousMap = new Map<string, number>();

  currentItems.filter(isExpenseTransaction).forEach((item) => {
    if (!item.kategoriId || !item.kategoriName) {
      return;
    }

    const currentItem = currentMap.get(item.kategoriId);

    if (currentItem) {
      currentItem.amount += item.nominal;
      return;
    }

    currentMap.set(item.kategoriId, {
      id: item.kategoriId,
      name: item.kategoriName,
      amount: item.nominal,
    });
  });

  previousItems.filter(isExpenseTransaction).forEach((item) => {
    if (!item.kategoriId) {
      return;
    }

    previousMap.set(
      item.kategoriId,
      (previousMap.get(item.kategoriId) ?? 0) + item.nominal,
    );
  });

  return [...currentMap.values()]
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 5)
    .map((item) => {
      const previousAmount = previousMap.get(item.id) ?? 0;
      const percentageChange =
        previousAmount > 0
          ? ((item.amount - previousAmount) / previousAmount) * 100
          : item.amount > 0
            ? null
            : 0;
      const trend = getPercentageTrendLabel(percentageChange) as
        | 'up'
        | 'down'
        | 'flat'
        | 'new';

      return {
        id: item.id,
        name: item.name,
        amount: item.amount,
        previousAmount,
        percentageChange,
        trend,
      };
    });
}

export async function getDashboardHomeDataService(
  userId: string,
  input: DashboardMonthInput,
): Promise<DashboardHomeData> {
  const selectedMonth = normalizeDashboardMonth(input.month);
  const selectedMonthStart = getMonthStart(selectedMonth);
  const selectedMonthEnd = getMonthEnd(selectedMonth);
  const previousMonth = shiftMonth(selectedMonth, -1);
  const earliestTrendMonth = shiftMonth(selectedMonth, -5);

  const rawItems = await findDashboardTransaksiByUserIdAndDateRange(
    userId,
    getMonthStart(earliestTrendMonth),
    selectedMonthEnd,
  );
  const items = rawItems.map((item) => mapDashboardTransaksiRecord(item));
  const selectedItems = items.filter(
    (item) => item.tanggal >= selectedMonthStart && item.tanggal <= selectedMonthEnd,
  );
  const previousItems = items.filter((item) =>
    item.tanggal.startsWith(previousMonth),
  );

  const expenses = sumNominal(selectedItems.filter(isExpenseTransaction));
  const income = sumNominal(selectedItems.filter(isIncomeTransaction));

  return {
    selectedMonth,
    overview: {
      balance: income - expenses,
      expenses,
      income,
      averageDailyExpense: Math.round(
        expenses / getAverageExpenseDayDivisor(selectedMonth),
      ),
    },
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
