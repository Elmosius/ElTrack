import { getAverageExpenseDayDivisor } from '#/lib/dashboard';
import type { DashboardTransaksiRecord } from '../mappers';

export function isExpenseTransaction(item: DashboardTransaksiRecord) {
  return item.tipeName.trim().toLowerCase() === 'pengeluaran';
}

export function isIncomeTransaction(item: DashboardTransaksiRecord) {
  return item.tipeName.trim().toLowerCase() === 'penghasilan';
}

export function sumNominal(list: DashboardTransaksiRecord[]) {
  return list.reduce((total, item) => total + item.nominal, 0);
}

export function buildDashboardOverview(
  selectedMonth: string,
  selectedItems: DashboardTransaksiRecord[],
) {
  const expenses = sumNominal(selectedItems.filter(isExpenseTransaction));
  const income = sumNominal(selectedItems.filter(isIncomeTransaction));

  return {
    balance: income - expenses,
    expenses,
    income,
    averageDailyExpense: Math.round(
      expenses / getAverageExpenseDayDivisor(selectedMonth),
    ),
  };
}
