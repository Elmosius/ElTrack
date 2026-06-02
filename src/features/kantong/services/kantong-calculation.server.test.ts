import { describe, expect, it } from 'vitest';
import type { SerializedKantong } from '#/types/kantong';
import { buildKantongPageData } from './kantong-calculation.server';

const kantongs: SerializedKantong[] = [
  {
    _id: 'kantong-cash',
    userId: 'user-1',
    nama: 'Tunai',
    bucket: 'cash',
    openingBalance: 500000,
    activatedAt: '2026-05-01T00:00:00.000Z',
    archivedAt: null,
  },
  {
    _id: 'kantong-gopay',
    userId: 'user-1',
    nama: 'GoPay',
    bucket: 'non_cash',
    openingBalance: 200000,
    activatedAt: '2026-05-01T00:00:00.000Z',
    archivedAt: null,
  },
];

describe('buildKantongPageData', () => {
  it('adds income and subtracts expenses per Kantong', () => {
    const result = buildKantongPageData(kantongs, [
      {
        kantongId: 'kantong-cash',
        nominal: 25000,
        tipeName: 'Pengeluaran',
        createdAt: '2026-05-02T00:00:00.000Z',
      },
      {
        kantongId: 'kantong-gopay',
        nominal: 100000,
        tipeName: 'Penghasilan',
        createdAt: '2026-05-02T00:00:00.000Z',
      },
    ]);

    expect(result.cashBalance).toBe(475000);
    expect(result.nonCashBalance).toBe(300000);
    expect(result.totalBalance).toBe(775000);
    expect(result.activeItems).toEqual([
      expect.objectContaining({
        nama: 'Tunai',
        currentBalance: 475000,
        expenses: 25000,
      }),
      expect.objectContaining({
        nama: 'GoPay',
        currentBalance: 300000,
        income: 100000,
      }),
    ]);
  });

  it('ignores transactions before the Kantong activation date', () => {
    const result = buildKantongPageData(kantongs, [
      {
        kantongId: 'kantong-cash',
        nominal: 999999,
        tipeName: 'Pengeluaran',
        createdAt: '2026-04-30T23:59:59.000Z',
      },
    ]);

    expect(result.cashBalance).toBe(500000);
    expect(result.totalBalance).toBe(700000);
  });
});
