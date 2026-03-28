import { Transaksi } from '#/db/models/transaksi.server';
import { Kategori } from '#/db/models/kategori.server';
import { connectDB } from '#/db/mongoose.server';
import type { CreateKategoriInput, DeleteKategoriInput, UpdateKategoriInput } from './kategori.schema';

async function ensureKategoriNameAvailable(userId: string, nama: string, ignoreId?: string) {
  const existingKategori = await Kategori.findOne({
    userId,
    nama: new RegExp(`^${escapeRegExp(nama)}$`, 'i'),
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
  }).lean();

  if (existingKategori) {
    throw new Error('Nama kategori sudah ada.');
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listKategori(userId: string) {
  await connectDB();

  return Kategori.find({ userId }).sort({ createdAt: 1 }).lean();
}

export async function createKategori(userId: string, data: CreateKategoriInput) {
  await connectDB();
  await ensureKategoriNameAvailable(userId, data.nama);

  const kategori = await Kategori.create({
    ...data,
    userId,
  });

  return kategori.toObject();
}

export async function updateKategori(userId: string, data: UpdateKategoriInput) {
  await connectDB();
  await ensureKategoriNameAvailable(userId, data.nama, data.id);

  const kategori = await Kategori.findOneAndUpdate(
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
      new: true,
      runValidators: true,
    },
  );

  if (!kategori) {
    throw new Error('Kategori tidak ditemukan.');
  }

  return kategori.toObject();
}

export async function deleteKategori(userId: string, data: DeleteKategoriInput) {
  await connectDB();

  const transaksiMasihPakai = await Transaksi.exists({
    userId,
    kategori: data.id,
  });

  if (transaksiMasihPakai) {
    throw new Error('Kategori ini masih dipakai transaksi, jadi belum bisa dihapus.');
  }

  const kategori = await Kategori.findOneAndDelete({
    _id: data.id,
    userId,
  });

  if (!kategori) {
    throw new Error('Kategori tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}
