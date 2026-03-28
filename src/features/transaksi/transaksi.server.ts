import type { CreateTransaksiInput } from './transaksi.schema';
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
