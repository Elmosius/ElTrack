import { getPercentageTrendLabel } from '#/lib/dashboard';
import type {
  DashboardDistributionItem,
  DashboardRecentTransaction,
  DashboardTopCategory,
} from '#/types/dashboard';
import type { DashboardTransaksiRecord } from '../mappers';
import { isExpenseTransaction } from './dashboard-overview-metrics.server';

export function buildDistributionItems(
  items: DashboardTransaksiRecord[],
  key: 'kategori' | 'metodePembayaran',
): DashboardDistributionItem[] {
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

export function buildRecentTransactions(
  items: DashboardTransaksiRecord[],
): DashboardRecentTransaction[] {
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

export function buildTopCategories(
  currentItems: DashboardTransaksiRecord[],
  previousItems: DashboardTransaksiRecord[],
): DashboardTopCategory[] {
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
