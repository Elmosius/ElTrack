import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';
import type {
  CreateTransaksiInput,
  DeleteTransaksiInput,
  UpdateTransaksiInput,
} from '../transaksi.schema';

export async function findTransaksiListByUserId(userId: string) {
  await connectDB();

  return Transaksi.find({ userId })
    .populate('kategori metodePembayaran tipe')
    .sort({ createdAt: 1 })
    .lean();
}

export async function insertTransaksi(userId: string, data: CreateTransaksiInput) {
  await connectDB();

  return Transaksi.create({
    ...data,
    userId,
  });
}

export async function updateTransaksiById(
  userId: string,
  data: UpdateTransaksiInput,
) {
  await connectDB();

  return Transaksi.findOneAndUpdate(
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
}

export async function deleteTransaksiByIdAndUserId(
  userId: string,
  data: DeleteTransaksiInput,
) {
  await connectDB();

  return Transaksi.findOneAndDelete({
    _id: data.id,
    userId,
  });
}
