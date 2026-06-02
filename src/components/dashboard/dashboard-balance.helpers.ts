import { Banknote, Landmark, WalletCards } from 'lucide-react';
import { formatRupiah, sanitizeNominal } from '#/lib/transaction-table';

export const balanceSetupToastCopy = {
  invalid: {
    title: 'Saldo belum valid',
    description: 'Masukkan saldo cash dan non-cash dengan angka positif.',
  },
  success: {
    title: 'Saldo awal tersimpan',
    description: 'Kantong awal akan dipakai untuk transaksi berikutnya.',
  },
  error: {
    title: 'Gagal menyimpan saldo',
    description: 'Terjadi kesalahan saat menyimpan saldo awal.',
  },
};

export const balanceCards = [
  {
    key: 'totalBalance',
    label: 'Total Saldo',
    description: 'Cash + non-cash',
    icon: WalletCards,
    tone: 'text-primary',
  },
  {
    key: 'cashBalance',
    label: 'Cash',
    description: 'Uang tunai',
    icon: Banknote,
    tone: 'text-emerald-600',
  },
  {
    key: 'nonCashBalance',
    label: 'Non-cash',
    description: 'Bank, QRIS, e-wallet, dan Kantong lain',
    icon: Landmark,
    tone: 'text-sky-600',
  },
] as const;

export function parseBalanceInput(value: string) {
  const normalized = Number(sanitizeNominal(value) || 0);
  return Number.isFinite(normalized) && normalized >= 0
    ? Math.round(normalized)
    : null;
}

export function formatBalanceInput(value: string) {
  return formatRupiah(value);
}
