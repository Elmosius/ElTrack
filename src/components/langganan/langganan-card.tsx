import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from '#/components/selia/alert-dialog';
import {
  deleteLanggananById,
  patchLanggananStatus,
  postLanggananPayment,
} from '#/features/langganan/langganan.functions';
import type { LanggananViewItem } from '#/types/langganan';
import { useRouter } from '@tanstack/react-router';
import {
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  Pencil,
  PlayCircle,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { toastManager } from '../selia/toast';
import {
  formatLanggananCurrency,
  formatLanggananDate,
  getLanggananToastError,
  getReminderLabel,
  getReminderTone,
} from './langganan-page.helpers';

type LanggananCardProps = {
  item: LanggananViewItem;
  onEdit: (item: LanggananViewItem) => void;
};

export function LanggananCard({ item, onEdit }: LanggananCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusSaving, setIsStatusSaving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const isPaused = item.status === 'dijeda';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLanggananById({ data: { id: item._id } });
      await router.invalidate();
      setIsDeleteDialogOpen(false);
      toastManager.add({
        type: 'success',
        title: 'Langganan dihapus',
        description: 'Langganan sudah dihapus dari daftar.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menghapus langganan',
        description: getLanggananToastError(
          error,
          'Terjadi kesalahan saat menghapus langganan.',
        ),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsStatusSaving(true);
      await patchLanggananStatus({
        data: {
          id: item._id,
          status: isPaused ? 'aktif' : 'dijeda',
        },
      });
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: isPaused ? 'Langganan aktif' : 'Langganan dijeda',
        description: isPaused
          ? 'Reminder langganan kembali aktif.'
          : 'Reminder langganan tidak dihitung sementara.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mengubah status',
        description: getLanggananToastError(
          error,
          'Terjadi kesalahan saat mengubah status.',
        ),
      });
    } finally {
      setIsStatusSaving(false);
    }
  };

  const handlePay = async () => {
    try {
      setIsPaying(true);
      await postLanggananPayment({ data: { id: item._id } });
      await router.invalidate();
      setIsPayDialogOpen(false);
      toastManager.add({
        type: 'success',
        title: 'Pembayaran tercatat',
        description: 'Transaksi pengeluaran sudah dibuat dan tanggal tagihan diperbarui.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mencatat pembayaran',
        description: getLanggananToastError(
          error,
          'Terjadi kesalahan saat mencatat pembayaran.',
        ),
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <Card className={item.reminderStatus === 'overdue' ? 'border-danger/40' : undefined}>
        <CardBody className='space-y-5 p-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 space-y-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <h3 className='truncate text-base font-semibold'>{item.nama}</h3>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getReminderTone(item.reminderStatus)}`}>
                  {getReminderLabel(item.reminderStatus, item.daysUntilDue)}
                </span>
              </div>

              <div className='flex flex-wrap items-center gap-1.5 text-xs text-muted'>
                <span className='rounded-full bg-accent px-2 py-1 capitalize'>
                  {item.frequency}
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1'>
                  <CalendarClock className='size-3.5' />
                  {formatLanggananDate(item.nextDueDate)}
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1'>
                  <WalletCards className='size-3.5' />
                  {item.kantongDetail?.nama ?? 'Kantong tidak tersedia'}
                </span>
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-1'>
              <Button
                size='xs-icon'
                variant='plain'
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.nama}`}
              >
                <Pencil className='size-4' />
              </Button>
              <Button
                size='xs-icon'
                variant='plain'
                disabled={isDeleting}
                progress={isDeleting}
                onClick={() => setIsDeleteDialogOpen(true)}
                aria-label={`Hapus ${item.nama}`}
                className='hover:text-danger'
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          </div>

          <div className='grid gap-3 rounded-lg bg-accent/45 p-4 text-sm md:grid-cols-3'>
            <div className='space-y-1'>
              <p className='text-xs text-muted'>Nominal</p>
              <p className='font-semibold'>{formatLanggananCurrency(item.nominal)}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-xs text-muted'>Estimasi bulanan</p>
              <p className='font-semibold'>
                {formatLanggananCurrency(item.monthlyEstimate)}
              </p>
            </div>
            <div className='space-y-1'>
              <p className='text-xs text-muted'>Terakhir bayar</p>
              <p className='font-semibold'>{formatLanggananDate(item.lastPaidAt)}</p>
            </div>
          </div>

          {item.catatan && (
            <p className='rounded-lg bg-accent/35 p-3 text-sm text-muted'>
              {item.catatan}
            </p>
          )}

          <div className='grid gap-2 sm:grid-cols-2'>
            <Button
              type='button'
              variant='outline'
              className='text-sm'
              disabled={isStatusSaving}
              progress={isStatusSaving}
              onClick={() => void handleToggleStatus()}
            >
              {isPaused ? <PlayCircle className='size-4' /> : <PauseCircle className='size-4' />}
              {isPaused ? 'Aktifkan' : 'Jeda'}
            </Button>
            <Button
              type='button'
              className='text-sm ring-0'
              disabled={isPaused || isPaying}
              progress={isPaying}
              onClick={() => setIsPayDialogOpen(true)}
            >
              <CheckCircle2 className='size-4' />
              Catat Bayar
            </Button>
          </div>
        </CardBody>
      </Card>

      <AlertDialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <CheckCircle2 className='size-5 text-primary' />
            <AlertDialogTitle>Catat pembayaran?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription className='text-sm'>
              Pembayaran <strong>{item.nama}</strong> sebesar{' '}
              <strong>{formatLanggananCurrency(item.nominal)}</strong> akan
              dibuat sebagai transaksi pengeluaran di Catatan Keuangan. Tanggal
              tagihan berikutnya akan otomatis diperbarui.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose
              render={
                <Button variant='plain' size='sm' className='text-sm' disabled={isPaying}>
                  Batal
                </Button>
              }
            />
            <Button
              size='sm'
              className='text-sm ring-0'
              disabled={isPaying}
              progress={isPaying}
              onClick={() => void handlePay()}
            >
              <CheckCircle2 className='size-4' />
              Catat Pembayaran
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <Trash2 className='size-5 text-danger' />
            <AlertDialogTitle>Hapus langganan?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription className='text-sm'>
              Langganan <strong>{item.nama}</strong> akan dihapus dari daftar.
              Transaksi yang sudah pernah dicatat tidak akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose
              render={
                <Button variant='plain' size='sm' className='text-sm' disabled={isDeleting}>
                  Batal
                </Button>
              }
            />
            <Button
              variant='danger'
              size='sm'
              className='text-sm'
              disabled={isDeleting}
              progress={isDeleting}
              onClick={() => void handleDelete()}
            >
              <Trash2 className='size-4' />
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
}
