import { Button } from '#/components/selia/button';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/selia/card';
import { Input } from '#/components/selia/input';
import { Textarea } from '#/components/selia/textarea';
import { patchLangganan, postLangganan } from '#/features/langganan/langganan.functions';
import { getTodayDateString } from '#/lib/transaction-table';
import type { LanggananViewItem } from '#/types/langganan';
import type { KantongSummaryItem } from '#/types/kantong';
import { useRouter } from '@tanstack/react-router';
import { Check, Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toastManager } from '../selia/toast';
import {
  formatLanggananMoneyInput,
  getLanggananToastError,
  parseLanggananMoneyInput,
} from './langganan-page.helpers';

type LanggananFormProps = {
  kantongs: KantongSummaryItem[];
  initialItem?: LanggananViewItem;
  onCancel?: () => void;
};

export function LanggananForm({
  kantongs,
  initialItem,
  onCancel,
}: LanggananFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialItem);
  const [nama, setNama] = useState(initialItem?.nama ?? '');
  const [nominal, setNominal] = useState(
    initialItem ? String(initialItem.nominal) : '',
  );
  const [frequency, setFrequency] = useState(initialItem?.frequency ?? 'bulanan');
  const [nextDueDate, setNextDueDate] = useState(
    initialItem?.nextDueDate ?? getTodayDateString(),
  );
  const [reminderDays, setReminderDays] = useState(
    String(initialItem?.reminderDays ?? 3),
  );
  const [kantongId, setKantongId] = useState(
    initialItem?.kantong ?? kantongs[0]?._id ?? '',
  );
  const [status, setStatus] = useState(initialItem?.status ?? 'aktif');
  const [catatan, setCatatan] = useState(initialItem?.catatan ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setNama('');
    setNominal('');
    setFrequency('bulanan');
    setNextDueDate(getTodayDateString());
    setReminderDays('3');
    setKantongId(kantongs[0]?._id ?? '');
    setStatus('aktif');
    setCatatan('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedNominal = parseLanggananMoneyInput(nominal);
    const parsedReminderDays = Number(reminderDays);

    if (
      !nama.trim() ||
      !parsedNominal ||
      !nextDueDate ||
      !kantongId ||
      !Number.isInteger(parsedReminderDays) ||
      parsedReminderDays < 0
    ) {
      toastManager.add({
        type: 'error',
        title: 'Langganan belum valid',
        description: 'Masukkan nama, nominal, tanggal, Kantong, dan reminder yang valid.',
      });
      return;
    }

    const payload = {
      nama,
      nominal: parsedNominal,
      frequency,
      nextDueDate,
      reminderDays: parsedReminderDays,
      kantong: kantongId,
      status,
      catatan,
    };

    try {
      setIsSaving(true);

      if (initialItem) {
        await patchLangganan({
          data: {
            id: initialItem._id,
            ...payload,
          },
        });
      } else {
        await postLangganan({ data: payload });
      }

      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: initialItem ? 'Langganan diperbarui' : 'Langganan ditambahkan',
        description: initialItem
          ? 'Perubahan langganan sudah disimpan.'
          : 'Langganan baru sudah masuk daftar.',
      });

      if (initialItem) {
        onCancel?.();
        return;
      }

      resetForm();
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: initialItem ? 'Gagal memperbarui langganan' : 'Gagal menambahkan langganan',
        description: getLanggananToastError(
          error,
          'Terjadi kesalahan saat menyimpan langganan.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Langganan' : 'Tambah Langganan'}</CardTitle>
        <CardDescription className='text-sm'>
          Catat layanan rutin dan pilih Kantong pembayaran. Notifikasi bisa diaktifkan terpisah, dan transaksi bayar otomatis masuk kategori Langganan.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form className='grid gap-4 xl:grid-cols-12' onSubmit={handleSubmit}>
          <label className='space-y-2 xl:col-span-3'>
            <span className='text-sm font-medium'>Nama</span>
            <Input
              className='text-sm'
              placeholder='Netflix'
              value={nama}
              onChange={(event) => setNama(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Nominal</span>
            <Input
              className='text-sm'
              inputMode='numeric'
              placeholder='Rp 0'
              value={formatLanggananMoneyInput(nominal)}
              onChange={(event) => setNominal(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Frekuensi</span>
            <select
              className='h-10 w-full rounded-md border border-secondary-border bg-background px-3 text-sm outline-none focus:border-primary'
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as 'bulanan' | 'tahunan')}
            >
              <option value='bulanan'>Bulanan</option>
              <option value='tahunan'>Tahunan</option>
            </select>
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Tagihan berikutnya</span>
            <Input
              className='text-sm'
              type='date'
              value={nextDueDate}
              onChange={(event) => setNextDueDate(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-3'>
            <span className='text-sm font-medium'>Reminder hari</span>
            <Input
              className='text-sm'
              type='number'
              min={0}
              value={reminderDays}
              onChange={(event) => setReminderDays(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-3'>
            <span className='text-sm font-medium'>Kantong</span>
            <select
              className='h-10 w-full rounded-md border border-secondary-border bg-background px-3 text-sm outline-none focus:border-primary'
              value={kantongId}
              onChange={(event) => setKantongId(event.target.value)}
            >
              {kantongs.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Status</span>
            <select
              className='h-10 w-full rounded-md border border-secondary-border bg-background px-3 text-sm outline-none focus:border-primary'
              value={status}
              onChange={(event) => setStatus(event.target.value as 'aktif' | 'dijeda')}
            >
              <option value='aktif'>Aktif</option>
              <option value='dijeda'>Dijeda</option>
            </select>
          </label>

          <label className='space-y-2 xl:col-span-7'>
            <span className='text-sm font-medium'>Catatan</span>
            <Textarea
              className='min-h-10 text-sm'
              placeholder='Opsional'
              value={catatan}
              onChange={(event) => setCatatan(event.target.value)}
            />
          </label>

          <div className='flex items-end gap-2 xl:col-span-12'>
            {initialItem && (
              <Button
                type='button'
                variant='outline'
                className='w-full text-sm'
                onClick={onCancel}
              >
                <X className='size-4' />
                Batal
              </Button>
            )}
            <Button
              type='submit'
              disabled={isSaving || kantongs.length === 0}
              progress={isSaving}
              className='w-full text-sm ring-0'
            >
              {initialItem ? <Check className='size-4' /> : <Plus className='size-4' />}
              {initialItem ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
