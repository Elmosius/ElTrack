import { describe, expect, it } from 'vitest';
import type { TransaksiPreviewGroup } from '#/types/chatbot';
import { classifyPreviewIntent } from './chatbot-preview-intent.server';

const completePreview: TransaksiPreviewGroup = {
  items: [
    {
      namaTransaksi: 'Makan Justus BTC',
      tanggal: '2026-05-10',
      nominal: 47999,
      waktu: 'Siang',
      kategoriName: 'Makan & Minum',
      kategoriId: '507f1f77bcf86cd799439012',
      metodePembayaranName: 'QRIS',
      metodePembayaranId: '507f1f77bcf86cd799439013',
      tipeName: 'Pengeluaran',
      tipeId: '507f1f77bcf86cd799439014',
      catatan: null,
      confidenceNotes: [],
      missingFields: [],
      canConfirm: true,
    },
  ],
  confidenceNotes: [],
  missingFields: [],
  canConfirm: true,
};

const missingNamePreview: TransaksiPreviewGroup = {
  ...completePreview,
  items: [
    {
      ...completePreview.items[0],
      namaTransaksi: null,
      missingFields: ['Nama transaksi belum terisi.'],
      canConfirm: false,
    },
  ],
  missingFields: ['Transaksi 1: Nama transaksi belum terisi.'],
  canConfirm: false,
};

function classify(
  latestUserMessage: string,
  activePreview: TransaksiPreviewGroup | null = completePreview,
) {
  return classifyPreviewIntent({
    latestUserMessage,
    activePreview,
    hasImageContent: false,
  });
}

describe('classifyPreviewIntent', () => {
  it.each(['halo', 'hai', 'test', 'test aimo', 'coba', 'ping', 'apa kabar'])(
    'treats "%s" as regular chat even when a preview is active',
    (message) => {
      expect(classify(message)).toBe('chat');
    },
  );

  it('treats explicit date correction as preview update', () => {
    expect(classify('tanggalnya hari ini')).toBe('update-preview');
  });

  it('treats explicit rename correction as preview update', () => {
    expect(classify('nama transaksinya Isi Bensin')).toBe('update-preview');
  });

  it('allows bare rename only when the active preview still needs a name', () => {
    expect(classify('Isi Bensin aja', missingNamePreview)).toBe(
      'update-preview',
    );
    expect(classify('Isi Bensin aja', completePreview)).toBe('chat');
  });

  it('treats a new transaction request as a new preview', () => {
    expect(classify('tolong catat makan 25 ribu qris')).toBe('new-preview');
  });

  it('does not create preview intent for regular chat without active preview', () => {
    expect(classify('halo', null)).toBe('chat');
  });
});
