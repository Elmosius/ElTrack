export type Waktu = 'Pagi' | 'Siang' | 'Sore' | 'Malam';

export type MetodePembayaran = 'Tunai' | 'Flazz' | 'Bank';

export type TipeTransaksi = 'Pengeluaran' | 'Penghasilan';

export type Kategori = {
  id: string;
  name: string;
};

export type TransaksiRow = {
  id: string;
  namaTransaksi: string;
  waktu: Waktu;
  nominal: string;
  kategoriId: string;
  metodePembayaran: MetodePembayaran;
  catatan: string;
  tipe: TipeTransaksi;
};

export type CategoryEditorMode = 'idle' | 'add' | 'edit';
