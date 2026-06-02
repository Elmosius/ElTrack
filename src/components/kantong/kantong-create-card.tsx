import { Button } from '#/components/selia/button';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/selia/card';
import { Input } from '#/components/selia/input';
import type { BalanceBucket } from '#/types/balance';
import { Plus } from 'lucide-react';
import { formatMoneyInput } from './kantong-page.helpers';
import { useKantongCreateForm } from './use-kantong-create-form';

export function KantongCreateCard() {
  const {
    bucket,
    handleSubmit,
    isSaving,
    nama,
    openingBalance,
    setBucket,
    setNama,
    setOpeningBalance,
  } = useKantongCreateForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Tambah Kantong</CardTitle>
        <CardDescription className='text-sm'>
          Buat Kantong seperti BCA, GoPay, Dana, atau dompet lain yang sering
          kamu pakai.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form
          className='grid gap-4 lg:grid-cols-[1fr_12rem_1fr_auto]'
          onSubmit={handleSubmit}
        >
          <label className='space-y-4'>
            <span className='text-sm font-medium'>Nama Kantong</span>
            <Input
              className='text-sm'
              placeholder='BCA / GoPay / Dana'
              value={nama}
              onChange={(event) => setNama(event.target.value)}
            />
          </label>
          <label className='space-y-2'>
            <span className='text-sm font-medium'>Bucket</span>
            <select
              className='h-10 w-full rounded-md border border-secondary-border bg-background px-3 text-sm outline-none focus:border-primary'
              value={bucket}
              onChange={(event) =>
                setBucket(event.target.value as BalanceBucket)
              }
            >
              <option value='cash'>Cash</option>
              <option value='non_cash'>Non-cash</option>
            </select>
          </label>
          <label className='space-y-2'>
            <span className='text-sm font-medium'>Saldo awal</span>
            <Input
              className='text-sm'
              inputMode='numeric'
              placeholder='Rp 0'
              value={formatMoneyInput(openingBalance)}
              onChange={(event) => setOpeningBalance(event.target.value)}
            />
          </label>
          <div className='flex items-end'>
            <Button
              type='submit'
              disabled={isSaving}
              progress={isSaving}
              className='w-full text-sm lg:w-auto ring-0'
            >
              <Plus className='size-4' />
              Tambah
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
