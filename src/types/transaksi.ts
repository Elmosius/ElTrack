export type SerializedNamedRef = {
  _id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SerializedTransaksi = {
  _id: string;
  userId: string;
  namaTransaksi: string;
  tanggal: string;
  nominal: number;
  catatan?: string;
  waktu?: string | null;
  kategori?: string | SerializedNamedRef | null;
  metodePembayaran?: string | SerializedNamedRef | null;
  tipe?: string | SerializedNamedRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SerializedKategori = {
  _id: string;
  userId: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SerializedMetodePembayaran = {
  _id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SerializedTipe = {
  _id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
};
