import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toastManager } from '#/components/selia/toast';
import { getKantongToastError, parseMoneyInput } from './kantong-page.helpers';
import { postTransferKantong } from '#/features/transaksi/transaksi.functions';
import { getTodayDateString } from '#/lib/transaction-table/format';
import type { KantongSummaryItem } from '#/types/kantong';

export function useKantongTransferForm(items: KantongSummaryItem[], onSuccess?: () => void) {
  const router = useRouter();
  
  const [sourceKantongId, setSourceKantongId] = useState(items[0]?._id || '');
  const [destKantongId, setDestKantongId] = useState(items[1]?._id || '');
  const [nominal, setNominal] = useState('');
  const [tanggal, setTanggal] = useState(getTodayDateString());
  const [waktu, setWaktu] = useState('Pagi');
  const [catatan, setCatatan] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    const sourceExists = items.some(item => item._id === sourceKantongId);
    if (!sourceExists) {
      setSourceKantongId(items[0]?._id || '');
    }

    const destExists = items.some(item => item._id === destKantongId);
    if (!destExists) {
      setDestKantongId(items.length > 1 ? items[1]?._id || '' : items[0]?._id || '');
    }
  }, [items, sourceKantongId, destKantongId]);

  const resetForm = useCallback(() => {
    setSourceKantongId(items[0]?._id || '');
    setDestKantongId(items.length > 1 ? items[1]?._id || '' : items[0]?._id || '');
    setNominal('');
    setTanggal(getTodayDateString());
    setWaktu('Pagi');
    setCatatan('');
  }, [items]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedNominal = parseMoneyInput(nominal);
    if (!parsedNominal || parsedNominal <= 0) {
      toastManager.add({
        type: 'error',
        title: 'Nominal tidak valid',
        description: 'Masukkan nominal transfer yang valid.',
      });
      return;
    }

    if (sourceKantongId === destKantongId) {
      toastManager.add({
        type: 'error',
        title: 'Kantong tidak valid',
        description: 'Kantong asal dan tujuan tidak boleh sama.',
      });
      return;
    }

    const sourceKantong = items.find(k => k._id === sourceKantongId);
    if (!sourceKantong) {
      toastManager.add({
        type: 'error',
        title: 'Kantong tidak valid',
        description: 'Kantong asal tidak ditemukan.',
      });
      return;
    }

    const destKantong = items.find(k => k._id === destKantongId);
    if (!destKantong) {
      toastManager.add({
        type: 'error',
        title: 'Kantong tidak valid',
        description: 'Kantong tujuan tidak ditemukan.',
      });
      return;
    }

    if (parsedNominal > sourceKantong.currentBalance) {
      toastManager.add({
        type: 'error',
        title: 'Saldo tidak mencukupi',
        description: `Saldo kantong ${sourceKantong.nama} tidak mencukupi.`,
      });
      return;
    }

    try {
      setIsSaving(true);
      await postTransferKantong({
        data: {
          sourceKantongId,
          destKantongId,
          nominal: parsedNominal,
          tanggal,
          waktu,
          catatan: catatan.trim() || undefined,
        },
      });
      
      resetForm();
      
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: 'Transfer berhasil',
        description: 'Transfer antar Kantong berhasil dicatat.',
      });
      onSuccess?.();
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mentransfer',
        description: getKantongToastError(
          error,
          'Terjadi kesalahan saat mentransfer antar Kantong.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    sourceKantongId,
    setSourceKantongId,
    destKantongId,
    setDestKantongId,
    nominal,
    setNominal,
    tanggal,
    setTanggal,
    waktu,
    setWaktu,
    catatan,
    setCatatan,
    isSaving,
    resetForm,
    handleSubmit,
  };
}
