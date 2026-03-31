export type DashboardTrendMode = 'weekly' | 'monthly';

export function getCurrentMonthValue(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function isValidDashboardMonth(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

export function normalizeDashboardMonth(value: unknown) {
  return isValidDashboardMonth(value) ? value : getCurrentMonthValue();
}

export function createMonthDate(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, (monthNumber || 1) - 1, 1);
}

export function formatMonthLabel(month: string) {
  const date = createMonthDate(month);

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function shiftMonth(month: string, offset: number) {
  const date = createMonthDate(month);
  date.setMonth(date.getMonth() + offset);
  return getCurrentMonthValue(date);
}

export function getMonthStart(month: string) {
  return `${month}-01`;
}

export function getMonthEnd(month: string) {
  const date = createMonthDate(month);
  date.setMonth(date.getMonth() + 1, 0);
  const year = date.getFullYear();
  const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${monthNumber}-${day}`;
}

export function getDaysInMonth(month: string) {
  const date = createMonthDate(month);
  date.setMonth(date.getMonth() + 1, 0);
  return date.getDate();
}

export function isCurrentMonth(month: string) {
  return month === getCurrentMonthValue();
}

export function getAverageExpenseDayDivisor(month: string) {
  if (isCurrentMonth(month)) {
    return Math.max(1, new Date().getDate());
  }

  return getDaysInMonth(month);
}

export function formatCurrency(value: number) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

export function formatSignedPercentage(value: number | null) {
  if (value == null) {
    return 'Baru bulan ini';
  }

  if (value === 0) {
    return 'Tetap';
  }

  const absoluteValue = Math.abs(value).toFixed(1);
  return `${value > 0 ? '+' : '-'}${absoluteValue}%`;
}

export function getPercentageTrendLabel(value: number | null) {
  if (value == null) {
    return 'new';
  }

  if (value > 0) {
    return 'up';
  }

  if (value < 0) {
    return 'down';
  }

  return 'flat';
}

export function getCategoryTrendTone(trend: 'up' | 'down' | 'flat' | 'new') {
  if (trend === 'up') {
    return 'text-danger';
  }

  if (trend === 'down') {
    return 'text-primary';
  }

  return 'text-muted';
}
