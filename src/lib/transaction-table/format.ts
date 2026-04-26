export const waktuOptionsStatic = ['Pagi', 'Siang', 'Sore', 'Malam'] as const;

export function sanitizeNominal(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatRupiah(value: string): string {
  const normalized = sanitizeNominal(value);

  if (!normalized) {
    return '';
  }

  return `Rp ${new Intl.NumberFormat('id-ID').format(Number(normalized))}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function formatTransactionDate(value: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
