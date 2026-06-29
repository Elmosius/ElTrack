import { Button } from '#/components/selia/button';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/selia/card';
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/selia/dialog';
import { Input } from '#/components/selia/input';
import type { BalanceBucket } from '#/types/balance';
import { Plus } from 'lucide-react';
import { useId } from 'react';
import { formatMoneyInput } from './kantong-page.helpers';
import { useKantongCreateForm } from './use-kantong-create-form';

type KantongCreateCardProps = {
  onSuccess?: () => void;
  variant?: 'card' | 'dialog';
};

export function KantongCreateCard({
  onSuccess,
  variant = 'card',
}: KantongCreateCardProps) {
  const formId = useId();
  const isDialog = variant === 'dialog';
  const {
    bucket,
    handleSubmit,
    isSaving,
    nama,
    openingBalance,
    setBucket,
    setNama,
    setOpeningBalance,
  } = useKantongCreateForm(onSuccess);

  const form = (
    <form
      id={formId}
      className='grid gap-3 md:gap-4 lg:grid-cols-[1fr_12rem_1fr_auto]'
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
          onChange={(event) => setBucket(event.target.value as BalanceBucket)}
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
      {!isDialog && (
        <div className='flex items-end'>
          <Button
            type='submit'
            disabled={isSaving}
            progress={isSaving}
            className='w-full text-sm ring-0 lg:w-auto'
          >
            <Plus className='size-4' />
            Tambah
          </Button>
        </div>
      )}
    </form>
  );

  const description =
    'Buat Kantong seperti BCA, GoPay, Dana, atau dompet lain yang sering kamu pakai.';

  if (isDialog) {
    return (
      <>
        <DialogHeader className='px-4 pt-4 md:px-6 md:pt-4.5'>
          <DialogTitle>Tambah Kantong</DialogTitle>
        </DialogHeader>
        <DialogBody className='max-h-[calc(100dvh-10rem)] overflow-y-auto px-4 py-4 md:px-6 md:py-4.5'>
          <DialogDescription className='text-sm'>
            {description}
          </DialogDescription>
          {form}
        </DialogBody>
        <DialogFooter className='sticky bottom-0 flex-col-reverse items-stretch gap-2 px-4 py-3 md:flex-row md:items-center md:px-6 md:py-3.5'>
          <DialogClose className='text-sm' disabled={isSaving}>
            Batal
          </DialogClose>
          <Button
            type='submit'
            form={formId}
            disabled={isSaving}
            progress={isSaving}
            className='w-full text-sm ring-0 md:w-auto'
          >
            <Plus className='size-4' />
            Tambah
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Tambah Kantong</CardTitle>
        <CardDescription className='text-sm'>
          {description}
        </CardDescription>
      </CardHeader>
      <CardBody>
        {form}
      </CardBody>
    </Card>
  );
}
