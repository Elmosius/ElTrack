import type { CreateTransaksiInput, DeleteTransaksiInput, UpdateTransaksiInput } from './transaksi.schema';
import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';

export async function listTransaksi(userId: string) {
  await connectDB();

  return Transaksi.find({ userId })
    .populate('waktu kategori metodePembayaran tipe')
    .sort({ createdAt: -1 })
    .lean();
}

export async function createTransaksi(userId: string, data: CreateTransaksiInput) {
  await connectDB();

  const transaksi = await Transaksi.create({
    ...data,
    userId,
  });

  return transaksi.toObject();
}

export async function updateTransaksi(userId: string, data: UpdateTransaksiInput) {
  await connectDB();

  const transaksi = await Transaksi.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    {
      $set: {
        namaTransaksi: data.namaTransaksi,
        waktu: data.waktu,
        nominal: data.nominal,
        kategori: data.kategori,
        metodePembayaran: data.metodePembayaran,
        catatan: data.catatan,
        tipe: data.tipe,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return transaksi.toObject();
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
