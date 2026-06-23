import { formatCurrency } from '#/lib/dashboard';
import { formatRupiah, sanitizeNominal } from '#/lib/transaction-table';

export function parseGoalMoneyInput(value: string) {
  const parsed = Number(sanitizeNominal(value) || 0);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

export function formatGoalMoneyInput(value: string) {
  return formatRupiah(value);
}

export function getGoalToastError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function formatGoalCurrency(value: number) {
  return formatCurrency(Math.round(value));
}

export function formatGoalPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatGoalDate(value?: string) {
  if (!value) {
    return 'Tanpa deadline';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 'Tanpa deadline';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
