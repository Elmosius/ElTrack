import { toastManager } from '#/components/selia/toast';
import {
  archiveKantongById,
  unarchiveKantongById,
} from '#/features/kantong/kantong.functions';
import type { KantongSummaryItem } from '#/types/kantong';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { getKantongToastError } from './kantong-page.helpers';

function getArchiveToastCopy(isUnarchive: boolean) {
  return {
    successTitle: isUnarchive
      ? 'Kantong diaktifkan kembali'
      : 'Kantong diarsipkan',
    successDescription: isUnarchive
      ? 'Kantong kembali muncul sebagai pilihan transaksi baru.'
      : 'Kantong tidak akan muncul sebagai pilihan transaksi baru.',
    errorTitle: isUnarchive
      ? 'Gagal mengaktifkan Kantong'
      : 'Gagal mengarsipkan Kantong',
    errorDescription: isUnarchive
      ? 'Terjadi kesalahan saat mengaktifkan Kantong.'
      : 'Terjadi kesalahan saat mengarsipkan Kantong.',
  };
}

export function useKantongArchiveAction(item: KantongSummaryItem) {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);

  const handleArchiveToggle = async () => {
    const isUnarchive = item.isArchived;
    const action = isUnarchive ? unarchiveKantongById : archiveKantongById;
    const copy = getArchiveToastCopy(isUnarchive);

    try {
      setIsMutating(true);
      await action({ data: { id: item._id } });
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: copy.successTitle,
        description: copy.successDescription,
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: copy.errorTitle,
        description: getKantongToastError(error, copy.errorDescription),
      });
    } finally {
      setIsMutating(false);
    }
  };

  return {
    isMutating,
    handleArchiveToggle,
  };
}
