export type Waktu = string;

export type MetodePembayaran = string;

export type TipeTransaksi = string;

export type Kategori = {
  id: string;
  name: string;
};

export type TransaksiRow = {
  id: string;
  tanggal: string;
  namaTransaksi: string;
  waktu: Waktu;
  nominal: string;
  kategoriId: string;
  metodePembayaran: MetodePembayaran;
  catatan: string;
  tipe: TipeTransaksi;
};

export type CategoryEditorMode = 'idle' | 'add' | 'edit';

export type TransactionTableData = {
  rows: TransaksiRow[];
  categories: Kategori[];
  waktuOptions: Waktu[];
  metodePembayaranOptions: MetodePembayaran[];
  tipeOptions: TipeTransaksi[];
};
