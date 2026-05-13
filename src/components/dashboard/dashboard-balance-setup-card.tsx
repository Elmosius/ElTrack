import { Button } from '#/components/selia/button';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/selia/card';
import { Input } from '#/components/selia/input';
import { toastManager } from '#/components/selia/toast';
import { saveBalanceSettings } from '#/features/balance/balance.functions';
import type { BalanceSummary } from '#/types/balance';
import { useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import {
  balanceSetupToastCopy,
  parseBalanceInput,
} from './dashboard-balance.helpers';

type DashboardBalanceSetupCardProps = {
  balance: BalanceSummary;
};

export function DashboardBalanceSetupCard({
  balance,
}: DashboardBalanceSetupCardProps) {
  const router = useRouter();
  const [openingCash, setOpeningCash] = useState(
    String(balance.openingCash || ''),
  );
  const [openingNonCash, setOpeningNonCash] = useState(
    String(balance.openingNonCash || ''),
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextOpeningCash = parseBalanceInput(openingCash);
    const nextOpeningNonCash = parseBalanceInput(openingNonCash);

    if (nextOpeningCash == null || nextOpeningNonCash == null) {
      toastManager.add({
        type: 'error',
        ...balanceSetupToastCopy.invalid,
      });
      return;
    }

    try {
      setIsSaving(true);
      await saveBalanceSettings({
        data: {
          openingCash: nextOpeningCash,
          openingNonCash: nextOpeningNonCash,
        },
      });
      await router.invalidate();
      toastManager.add({
        type: 'success',
        ...balanceSetupToastCopy.success,
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: balanceSetupToastCopy.error.title,
        description:
          error instanceof Error
            ? error.message
            : balanceSetupToastCopy.error.description,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className='overflow-hidden border-dashed'>
      <CardHeader>
        <div>
          <CardTitle className='text-base'>Aktifkan Balance</CardTitle>
          <CardDescription className='mt-2 text-sm'>
            Masukkan kondisi uangmu saat ini. Transaksi lama tidak akan ikut
            dihitung.
          </CardDescription>
        </div>
      </CardHeader>
      <CardBody>
        <form
          className='grid gap-4 md:grid-cols-[1fr_1fr_auto]'
          onSubmit={handleSubmit}
        >
          <label className='space-y-2'>
            <span className='text-sm font-medium'>Saldo cash</span>
            <Input
              min={0}
              type='number'
              inputMode='numeric'
              placeholder='500000'
              value={openingCash}
              onChange={(event) => setOpeningCash(event.target.value)}
            />
          </label>
          <label className='space-y-2'>
            <span className='text-sm font-medium'>Saldo non-cash</span>
            <Input
              min={0}
              type='number'
              inputMode='numeric'
              placeholder='500000'
              value={openingNonCash}
              onChange={(event) => setOpeningNonCash(event.target.value)}
            />
          </label>
          <div className='flex items-end'>
            <Button
              type='submit'
              disabled={isSaving}
              progress={isSaving}
              className='text-sm w-full md:w-auto ring-0'
            >
              Simpan saldo
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
