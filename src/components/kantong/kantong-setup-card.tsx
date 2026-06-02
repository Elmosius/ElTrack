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
import { saveDefaultKantongSetup } from '#/features/kantong/kantong.functions';
import { useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import {
  formatMoneyInput,
  getKantongToastError,
  parseMoneyInput,
} from './kantong-page.helpers';

export function KantongSetupCard() {
  const router = useRouter();
  const [openingCash, setOpeningCash] = useState('');
  const [openingNonCash, setOpeningNonCash] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cash = parseMoneyInput(openingCash);
    const nonCash = parseMoneyInput(openingNonCash);

    if (cash == null || nonCash == null) {
      toastManager.add({
        type: 'error',
        title: 'Saldo belum valid',
        description: 'Masukkan saldo awal cash dan non-cash dengan angka positif.',
      });
      return;
    }

    try {
      setIsSaving(true);
      await saveDefaultKantongSetup({
        data: {
          openingCash: cash,
          openingNonCash: nonCash,
        },
      });
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: 'Kantong awal tersimpan',
        description: 'Sekarang transaksi baru bisa memakai Kantong.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menyimpan Kantong',
        description: getKantongToastError(
          error,
          'Terjadi kesalahan saat menyimpan Kantong awal.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className='overflow-hidden border-dashed'>
      <CardHeader>
        <CardTitle className='text-base'>Aktifkan Kantong</CardTitle>
        <CardDescription className='mt-2 text-sm'>
          Masukkan saldo aktualmu sekarang. Transaksi lama tetap aman, dan
          saldo Kantong mulai dihitung dari titik ini.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form
          className='grid gap-4 md:grid-cols-[1fr_1fr_auto]'
          onSubmit={handleSubmit}
        >
          <label className='space-y-2'>
            <span className='text-sm font-medium'>Saldo cash</span>
            <Input
              inputMode='numeric'
              placeholder='Rp 500.000'
              value={formatMoneyInput(openingCash)}
              onChange={(event) => setOpeningCash(event.target.value)}
            />
          </label>
          <label className='space-y-2'>
            <span className='text-sm font-medium'>Saldo non-cash</span>
            <Input
              inputMode='numeric'
              placeholder='Rp 500.000'
              value={formatMoneyInput(openingNonCash)}
              onChange={(event) => setOpeningNonCash(event.target.value)}
            />
          </label>
          <div className='flex items-end'>
            <Button
              type='submit'
              disabled={isSaving}
              progress={isSaving}
              className='w-full text-sm md:w-auto'
            >
              Simpan Kantong
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
