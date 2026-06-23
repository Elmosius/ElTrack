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
import {
  patchSavingGoal,
  postSavingGoal,
} from '#/features/goals/goals.functions';
import type { GoalViewItem } from '#/types/goals';
import type { KantongSummaryItem } from '#/types/kantong';
import { useRouter } from '@tanstack/react-router';
import { Check, Plus, X } from 'lucide-react';
import { useId, useMemo, useState, type FormEvent } from 'react';
import { toastManager } from '../selia/toast';
import {
  formatGoalMoneyInput,
  getGoalToastError,
  parseGoalMoneyInput,
} from './goals-page.helpers';

type GoalFormProps = {
  kantongs: KantongSummaryItem[];
  mediaSuggestions: string[];
  initialGoal?: GoalViewItem;
  onCancel?: () => void;
};

export function GoalForm({
  kantongs,
  mediaSuggestions,
  initialGoal,
  onCancel,
}: GoalFormProps) {
  const router = useRouter();
  const mediaListId = useId();
  const isEditing = Boolean(initialGoal);
  const [nama, setNama] = useState(initialGoal?.nama ?? '');
  const [media, setMedia] = useState(initialGoal?.media ?? 'Reksadana');
  const [kantong, setKantong] = useState(
    initialGoal?.kantong ?? kantongs[0]?._id ?? '',
  );
  const [targetAmount, setTargetAmount] = useState(
    initialGoal ? String(initialGoal.targetAmount) : '',
  );
  const [deadline, setDeadline] = useState(initialGoal?.deadline ?? '');
  const [monthlyContributionTarget, setMonthlyContributionTarget] = useState(
    initialGoal?.monthlyContributionTarget
      ? String(initialGoal.monthlyContributionTarget)
      : '',
  );
  const [catatan, setCatatan] = useState(initialGoal?.catatan ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const normalizedMediaSuggestions = useMemo(
    () => Array.from(new Set(mediaSuggestions.filter(Boolean))),
    [mediaSuggestions],
  );

  const resetForm = () => {
    setNama('');
    setMedia('Reksadana');
    setKantong(kantongs[0]?._id ?? '');
    setTargetAmount('');
    setDeadline('');
    setMonthlyContributionTarget('');
    setCatatan('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedTarget = parseGoalMoneyInput(targetAmount);
    const parsedMonthly = monthlyContributionTarget.trim()
      ? parseGoalMoneyInput(monthlyContributionTarget)
      : undefined;

    if (!nama.trim() || !media.trim() || !kantong || !parsedTarget) {
      toastManager.add({
        type: 'error',
        title: 'Goal belum valid',
        description: 'Masukkan nama, media, Kantong, dan target yang valid.',
      });
      return;
    }

    if (parsedMonthly === null) {
      toastManager.add({
        type: 'error',
        title: 'Setoran rutin belum valid',
        description: 'Masukkan nominal setoran rutin yang valid.',
      });
      return;
    }

    const payload = {
      nama,
      media,
      kantong,
      targetAmount: parsedTarget,
      deadline,
      monthlyContributionTarget: parsedMonthly,
      catatan,
    };

    try {
      setIsSaving(true);

      if (initialGoal) {
        await patchSavingGoal({
          data: {
            id: initialGoal._id,
            ...payload,
          },
        });
      } else {
        await postSavingGoal({ data: payload });
      }

      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: initialGoal ? 'Goal diperbarui' : 'Goal ditambahkan',
        description: initialGoal
          ? 'Perubahan goal sudah disimpan.'
          : 'Goal baru sudah masuk daftar.',
      });

      if (initialGoal) {
        onCancel?.();
        return;
      }

      resetForm();
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: initialGoal ? 'Gagal memperbarui goal' : 'Gagal menambahkan goal',
        description: getGoalToastError(
          error,
          'Terjadi kesalahan saat menyimpan goal.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Goal' : 'Tambah Goal'}</CardTitle>
        <CardDescription className='text-sm'>
          Hubungkan target ke Kantong supaya progress terbaca otomatis dari
          saldo Kantong.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form className='grid gap-4 xl:grid-cols-12' onSubmit={handleSubmit}>
          <label className='space-y-2 xl:col-span-3'>
            <span className='text-sm font-medium'>Nama Goal</span>
            <Input
              className='text-sm'
              placeholder='Dana investasi'
              value={nama}
              onChange={(event) => setNama(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Media</span>
            <Input
              className='text-sm'
              list={mediaListId}
              placeholder='Reksadana'
              value={media}
              onChange={(event) => setMedia(event.target.value)}
            />
            <datalist id={mediaListId}>
              {normalizedMediaSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Kantong</span>
            <select
              className='h-10 w-full rounded-md border border-secondary-border bg-background px-3 text-sm outline-none focus:border-primary'
              value={kantong}
              onChange={(event) => setKantong(event.target.value)}
            >
              {kantongs.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2 xl:col-span-2'>
            <span className='text-sm font-medium'>Target</span>
            <Input
              className='text-sm'
              inputMode='numeric'
              placeholder='Rp 0'
              value={formatGoalMoneyInput(targetAmount)}
              onChange={(event) => setTargetAmount(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-3'>
            <span className='text-sm font-medium'>Deadline</span>
            <Input
              className='text-sm'
              type='date'
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>

          <label className='space-y-2 xl:col-span-3'>
            <span className='text-sm font-medium'>Setoran rutin</span>
            <Input
              className='text-sm'
              inputMode='numeric'
              placeholder='Opsional'
              value={formatGoalMoneyInput(monthlyContributionTarget)}
              onChange={(event) =>
                setMonthlyContributionTarget(event.target.value)
              }
            />
          </label>

          <label className='space-y-2 xl:col-span-9'>
            <span className='text-sm font-medium'>Catatan</span>
            <Textarea
              className='min-h-10 text-sm'
              placeholder='Opsional'
              value={catatan}
              onChange={(event) => setCatatan(event.target.value)}
            />
          </label>

          <div className='flex items-end gap-2 xl:col-span-12'>
            {initialGoal && (
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
              {initialGoal ? (
                <Check className='size-4' />
              ) : (
                <Plus className='size-4' />
              )}
              {initialGoal ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
