import { describe, expect, it } from 'vitest';
import type { BalanceSettings } from '#/types/balance';
import {
  buildBalanceSummary,
  classifyBalanceBucket,
} from './balance-calculation.server';

const settings: BalanceSettings = {
  _id: 'balance-1',
  userId: 'user-1',
  openingCash: 500000,
  openingNonCash: 500000,
  activatedAt: '2026-05-13T00:00:00.000Z',
};

describe('classifyBalanceBucket', () => {
  it.each(['Tunai', 'Cash', 'uang tunai', 'Kas'])(
    'classifies %s as cash',
    (methodName) => {
      expect(classifyBalanceBucket(methodName)).toBe('cash');
    },
  );

  it.each(['QRIS', 'Bank BCA', 'Debit', 'GoPay'])(
    'classifies %s as non-cash',
    (methodName) => {
      expect(classifyBalanceBucket(methodName)).toBe('non_cash');
    },
  );
});

describe('buildBalanceSummary', () => {
  it('adds income and subtracts expenses by balance bucket', () => {
    const summary = buildBalanceSummary(settings, [
      {
        nominal: 25000,
        metodePembayaranName: 'Tunai',
        tipeName: 'Pengeluaran',
      },
      {
        nominal: 100000,
        metodePembayaranName: 'QRIS',
        tipeName: 'Penghasilan',
      },
      {
        nominal: 30000,
        metodePembayaranName: 'Bank BCA',
        tipeName: 'Pengeluaran',
      },
    ]);

    expect(summary.cashBalance).toBe(475000);
    expect(summary.nonCashBalance).toBe(570000);
    expect(summary.totalBalance).toBe(1045000);
    expect(summary.cashExpenses).toBe(25000);
    expect(summary.nonCashIncome).toBe(100000);
    expect(summary.nonCashExpenses).toBe(30000);
    expect(summary.kantongs).toEqual([]);
  });
});
