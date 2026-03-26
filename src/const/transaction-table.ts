import type { Kategori, MetodePembayaran, TipeTransaksi, TransaksiRow, Waktu } from '#/types/transaction-table';

export const waktuOptions: Waktu[] = ['Pagi', 'Siang', 'Sore', 'Malam'];

export const metodeOptions: MetodePembayaran[] = ['Tunai', 'Flazz', 'Bank'];

export const tipeOptions: TipeTransaksi[] = ['Pengeluaran', 'Penghasilan'];

export const initialCategories: Kategori[] = [
  { id: 'cat-makan-minum', name: 'Makan & Minum' },
  { id: 'cat-transportasi', name: 'Transportasi' },
  { id: 'cat-tagihan', name: 'Tagihan' },
  { id: 'cat-hiburan', name: 'Hiburan' },
  { id: 'cat-gaji', name: 'Gaji' },
];

export const initialRows: TransaksiRow[] = [
  {
    id: 'row-1',
    tanggal: '2026-03-26',
    namaTransaksi: 'Kopi pagi kantor',
    waktu: 'Pagi',
    nominal: '28000',
    kategoriId: 'cat-makan-minum',
    metodePembayaran: 'Flazz',
    catatan: 'Meeting tim produk',
    tipe: 'Pengeluaran',
  },
  {
    id: 'row-2',
    tanggal: '2026-03-26',
    namaTransaksi: 'Bayar internet rumah',
    waktu: 'Siang',
    nominal: '350000',
    kategoriId: 'cat-tagihan',
    metodePembayaran: 'Bank',
    catatan: '',
    tipe: 'Pengeluaran',
  },
  {
    id: 'row-3',
    tanggal: '2026-03-25',
    namaTransaksi: 'Transfer gaji bulanan',
    waktu: 'Sore',
    nominal: '6500000',
    kategoriId: 'cat-gaji',
    metodePembayaran: 'Bank',
    catatan: 'Periode Maret',
    tipe: 'Penghasilan',
  },
];
