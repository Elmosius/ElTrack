import type { TransaksiRow } from '#/types/transaction-table';

export function parseIsoDate(value: string): Date | undefined {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

export function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDaysWithTransactions(rows: TransaksiRow[]): Date[] {
  return Array.from(new Set(rows.map((row) => row.tanggal)))
    .map(parseIsoDate)
    .filter((date): date is Date => Boolean(date));
}

export function getDailyTransactions(rows: TransaksiRow[], date: string | null): TransaksiRow[] {
  if (!date) {
    return [];
  }

  return rows.filter((row) => row.tanggal === date);
}

export function getDailyTotal(rows: TransaksiRow[]): number {
  return rows.reduce((total, row) => total + Number(row.nominal || 0), 0);
}
