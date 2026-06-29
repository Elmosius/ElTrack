import { toastManager } from '#/components/selia/toast';
import { postKantong } from '#/features/kantong/kantong.functions';
import type { BalanceBucket } from '#/types/balance';
import { useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { getKantongToastError, parseMoneyInput } from './kantong-page.helpers';

export function useKantongCreateForm(onSuccess?: () => void) {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [bucket, setBucket] = useState<BalanceBucket>('non_cash');
  const [openingBalance, setOpeningBalance] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setNama('');
    setOpeningBalance('');
    setBucket('non_cash');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedOpeningBalance = parseMoneyInput(openingBalance);

    if (!nama.trim() || parsedOpeningBalance == null) {
      toastManager.add({
        type: 'error',
        title: 'Kantong belum valid',
        description: 'Masukkan nama Kantong dan saldo awal yang valid.',
      });
      return;
    }

    try {
      setIsSaving(true);
      await postKantong({
        data: {
          nama,
          bucket,
          openingBalance: parsedOpeningBalance,
        },
      });
      resetForm();
      await router.invalidate();
      onSuccess?.();
      toastManager.add({
        type: 'success',
        title: 'Kantong ditambahkan',
        description: 'Kantong baru sudah bisa dipakai untuk transaksi.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menambahkan Kantong',
        description: getKantongToastError(
          error,
          'Terjadi kesalahan saat menambahkan Kantong.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    bucket,
    handleSubmit,
    isSaving,
    nama,
    openingBalance,
    setBucket,
    setNama,
    setOpeningBalance,
  };
}
