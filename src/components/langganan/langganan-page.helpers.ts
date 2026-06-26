import { formatCurrency } from '#/lib/dashboard';
import { formatRupiah, sanitizeNominal } from '#/lib/transaction-table';
import type { LanggananReminderStatus } from '#/types/langganan';

export function parseLanggananMoneyInput(value: string) {
  const parsed = Number(sanitizeNominal(value) || 0);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

export function formatLanggananMoneyInput(value: string) {
  return formatRupiah(value);
}

export function formatLanggananCurrency(value: number) {
  return formatCurrency(Math.round(value));
}

export function getLanggananToastError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function formatLanggananDate(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getReminderLabel(status: LanggananReminderStatus, daysUntilDue: number) {
  if (status === 'paused') {
    return 'Dijeda';
  }

  if (status === 'overdue') {
    return `Terlambat ${Math.abs(daysUntilDue)} hari`;
  }

  if (status === 'due-soon') {
    return daysUntilDue === 0 ? 'Jatuh tempo hari ini' : `Dalam ${daysUntilDue} hari`;
  }

  return 'Aman';
}

export function getReminderTone(status: LanggananReminderStatus) {
  if (status === 'overdue') {
    return 'bg-danger/10 text-danger';
  }

  if (status === 'due-soon') {
    return 'bg-warning/10 text-warning';
  }

  if (status === 'paused') {
    return 'bg-muted/10 text-muted';
  }

  return 'bg-success/10 text-success';
}
