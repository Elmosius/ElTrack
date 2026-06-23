import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import { deleteSavingGoalById } from '#/features/goals/goals.functions';
import type { GoalViewItem } from '#/types/goals';
import { useRouter } from '@tanstack/react-router';
import { CalendarDays, CheckCircle2, Pencil, Trash2, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { toastManager } from '../selia/toast';
import {
  formatGoalCurrency,
  formatGoalDate,
  formatGoalPercent,
  getGoalToastError,
} from './goals-page.helpers';

type GoalCardProps = {
  goal: GoalViewItem;
  onEdit: (goal: GoalViewItem) => void;
};

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const progressWidth = `${Math.round(goal.progressPercent)}%`;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Hapus goal "${goal.nama}"? Kantong dan transaksi tidak akan ikut terhapus.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteSavingGoalById({ data: { id: goal._id } });
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: 'Goal dihapus',
        description: 'Goal sudah dihapus dari daftar.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menghapus goal',
        description: getGoalToastError(
          error,
          'Terjadi kesalahan saat menghapus goal.',
        ),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className={goal.isComplete ? 'border-success/40' : undefined}>
      <CardBody className='space-y-5 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='truncate text-base font-semibold'>{goal.nama}</h3>
              {goal.isComplete && (
                <span className='inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs text-success'>
                  <CheckCircle2 className='size-3.5' />
                  Selesai
                </span>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-1.5 text-xs text-muted'>
              <span className='rounded-full bg-accent px-2 py-1'>
                {goal.media}
              </span>
              <span className='inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1'>
                <WalletCards className='size-3.5' />
                {goal.kantongDetail?.nama ?? 'Kantong tidak tersedia'}
              </span>
              <span className='inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1'>
                <CalendarDays className='size-3.5' />
                {formatGoalDate(goal.deadline)}
              </span>
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-1'>
            <Button
              size='xs-icon'
              variant='plain'
              onClick={() => onEdit(goal)}
              aria-label={`Edit ${goal.nama}`}
            >
              <Pencil className='size-4' />
            </Button>
            <Button
              size='xs-icon'
              variant='plain'
              disabled={isDeleting}
              progress={isDeleting}
              onClick={() => void handleDelete()}
              aria-label={`Hapus ${goal.nama}`}
              className='hover:text-danger'
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-3 text-sm'>
            <span className='text-muted'>Progress</span>
            <span className='font-medium'>
              {formatGoalPercent(goal.progressPercent)}
            </span>
          </div>
          <div className='h-2.5 overflow-hidden rounded-full bg-accent'>
            <div
              className='h-full rounded-full bg-primary transition-[width]'
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <div className='grid gap-3 rounded-2xl bg-accent/45 p-4 text-sm md:grid-cols-3'>
          <div className='space-y-1'>
            <p className='text-xs text-muted'>Saldo sekarang</p>
            <p className='font-semibold'>
              {formatGoalCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted'>Target</p>
            <p className='font-semibold'>
              {formatGoalCurrency(goal.targetAmount)}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs text-muted'>Sisa</p>
            <p className='font-semibold'>
              {formatGoalCurrency(goal.remainingAmount)}
            </p>
          </div>
        </div>

        <div className='grid gap-3 text-sm md:grid-cols-2'>
          <div className='rounded-xl border border-card-separator p-3'>
            <p className='text-xs text-muted'>Setoran ideal</p>
            <p className='mt-1 font-medium'>
              {goal.idealMonthlyContribution == null
                ? 'Isi deadline untuk estimasi'
                : goal.monthsRemaining === 0
                  ? `${formatGoalCurrency(goal.idealMonthlyContribution)} sekarang`
                  : `${formatGoalCurrency(goal.idealMonthlyContribution)} / bulan`}
            </p>
          </div>
          <div className='rounded-xl border border-card-separator p-3'>
            <p className='text-xs text-muted'>Setoran rutin rencana</p>
            <p className='mt-1 font-medium'>
              {goal.monthlyContributionTarget
                ? `${formatGoalCurrency(goal.monthlyContributionTarget)} / bulan`
                : 'Belum diisi'}
            </p>
          </div>
        </div>

        {goal.catatan && (
          <p className='rounded-xl bg-accent/35 p-3 text-sm text-muted'>
            {goal.catatan}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
