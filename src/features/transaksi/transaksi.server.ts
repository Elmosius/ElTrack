import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';
import type { CreateTransaksiInput, DeleteTransaksiInput, UpdateTransaksiInput } from './transaksi.schema';

type SerializedNamedRef = {
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

function serializeDate(value: Date | string | undefined) {
  return value instanceof Date ? value.toISOString() : value;
}

function serializeTransaksiDoc(item: {
  _id: unknown;
  userId: string;
  namaTransaksi: string;
  tanggal: string;
  nominal: number;
  catatan?: string;
  waktu?: unknown;
  kategori?: unknown;
  metodePembayaran?: unknown;
  tipe?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SerializedTransaksi {
  return {
    _id: String(item._id),
    userId: item.userId,
    namaTransaksi: item.namaTransaksi,
    tanggal: item.tanggal,
    nominal: item.nominal,
    catatan: item.catatan,
    createdAt: serializeDate(item.createdAt),
    updatedAt: serializeDate(item.updatedAt),
    waktu: item.waktu == null ? item.waktu : String(item.waktu),
    kategori: serializeNamedRef(item.kategori),
    metodePembayaran: serializeNamedRef(item.metodePembayaran),
    tipe: serializeNamedRef(item.tipe),
  };
}

function serializeNamedRef(value: unknown): string | SerializedNamedRef | null | undefined {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && '_id' in value) {
    const record = value as {
      _id: unknown;
      nama?: string;
      createdAt?: Date | string;
      updatedAt?: Date | string;
    };

    return {
      _id: String(record._id),
      nama: record.nama ?? '',
      createdAt: serializeDate(record.createdAt),
      updatedAt: serializeDate(record.updatedAt),
    };
  }

  return String(value);
}

export async function listTransaksi(userId: string): Promise<SerializedTransaksi[]> {
  await connectDB();

  const list = await Transaksi.find({ userId }).populate('kategori metodePembayaran tipe').sort({ createdAt: 1 }).lean();

  return list.map((item) => serializeTransaksiDoc(item));
}

export async function createTransaksi(userId: string, data: CreateTransaksiInput): Promise<SerializedTransaksi> {
  await connectDB();

  const transaksi = await Transaksi.create({
    ...data,
    userId,
  });

  return serializeTransaksiDoc(transaksi.toObject());
}

export async function updateTransaksi(userId: string, data: UpdateTransaksiInput): Promise<SerializedTransaksi> {
  await connectDB();

  const transaksi = await Transaksi.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    {
      $set: {
        namaTransaksi: data.namaTransaksi,
        tanggal: data.tanggal,
        waktu: data.waktu,
        nominal: data.nominal,
        kategori: data.kategori,
        metodePembayaran: data.metodePembayaran,
        catatan: data.catatan,
        tipe: data.tipe,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return serializeTransaksiDoc(transaksi.toObject());
}

export async function deleteTransaksi(userId: string, data: DeleteTransaksiInput) {
  await connectDB();

  const transaksi = await Transaksi.findOneAndDelete({
    _id: data.id,
    userId,
  });

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}
