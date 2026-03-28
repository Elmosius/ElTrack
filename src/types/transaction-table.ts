export type Kategori = {
  id: string;
  name: string;
};

export type SelectOption = {
  id: string;
  name: string;
};

export type TransaksiRow = {
  id: string;
  tanggal: string;
  namaTransaksi: string;
  waktuId: string;
  nominal: string;
  kategoriId: string;
  metodePembayaranId: string;
  catatan: string;
  tipeId: string;
};

export type CategoryEditorMode = 'idle' | 'add' | 'edit';

export type TransactionTableData = {
  rows: TransaksiRow[];
  categories: Kategori[];
  waktuOptions: SelectOption[];
  metodePembayaranOptions: SelectOption[];
  tipeOptions: SelectOption[];
};
