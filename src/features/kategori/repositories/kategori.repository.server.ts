import { Kategori } from '#/db/models/kategori.server';
import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';
import type {
  CreateKategoriInput,
  DeleteKategoriInput,
  UpdateKategoriInput,
} from '../kategori.schema';

export async function findKategoriListByUserId(userId: string) {
  await connectDB();

  return Kategori.find({ userId }).sort({ createdAt: 1 }).lean();
}

export async function findKategoriByName(
  userId: string,
  namaPattern: RegExp,
  ignoreId?: string,
) {
  await connectDB();

  return Kategori.findOne({
    userId,
    nama: namaPattern,
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
  }).lean();
}

export async function insertKategori(userId: string, data: CreateKategoriInput) {
  await connectDB();

  return Kategori.create({
    ...data,
    userId,
  });
}

export async function updateKategoriById(
  userId: string,
  data: UpdateKategoriInput,
) {
  await connectDB();

  return Kategori.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    {
      $set: {
        nama: data.nama,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function hasKategoriTransactions(
  userId: string,
  data: DeleteKategoriInput,
) {
  await connectDB();

  return Transaksi.exists({
    userId,
    kategori: data.id,
  });
}

export async function deleteKategoriByIdAndUserId(
  userId: string,
  data: DeleteKategoriInput,
) {
  await connectDB();

  return Kategori.findOneAndDelete({
    _id: data.id,
    userId,
  });
}
