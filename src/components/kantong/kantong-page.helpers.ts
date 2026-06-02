import type { BalanceBucket } from '#/types/balance';
import { formatRupiah, sanitizeNominal } from '#/lib/transaction-table';

export function formatMoneyInput(value: string) {
  return formatRupiah(value);
}

export function parseMoneyInput(value: string) {
  const parsed = Number(sanitizeNominal(value) || 0);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

export function bucketLabel(bucket: BalanceBucket) {
  return bucket === 'cash' ? 'Cash' : 'Non-cash';
}

export function getKantongToastError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
