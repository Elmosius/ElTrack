import type {
  CreateKategoriInput,
  DeleteKategoriInput,
  UpdateKategoriInput,
} from '../kategori.schema';
import { serializeKategoriDoc, type SerializedKategori } from '../mappers';
import {
  deleteKategoriByIdAndUserId,
  findKategoriByName,
  findKategoriListByUserId,
  hasKategoriTransactions,
  insertKategori,
  updateKategoriById,
} from '../repositories/kategori.repository.server';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureKategoriNameAvailable(
  userId: string,
  nama: string,
  ignoreId?: string,
) {
  const existingKategori = await findKategoriByName(
    userId,
    new RegExp(`^${escapeRegExp(nama)}$`, 'i'),
    ignoreId,
  );

  if (existingKategori) {
    throw new Error('Nama kategori sudah ada.');
  }
}

export async function listKategoriService(
  userId: string,
): Promise<SerializedKategori[]> {
  const list = await findKategoriListByUserId(userId);
  return list.map((item) => serializeKategoriDoc(item));
}

export async function createKategoriService(
  userId: string,
  data: CreateKategoriInput,
): Promise<SerializedKategori> {
  await ensureKategoriNameAvailable(userId, data.nama);
  const kategori = await insertKategori(userId, data);
  return serializeKategoriDoc(kategori.toObject());
}

export async function updateKategoriService(
  userId: string,
  data: UpdateKategoriInput,
): Promise<SerializedKategori> {
  await ensureKategoriNameAvailable(userId, data.nama, data.id);

  const kategori = await updateKategoriById(userId, data);

  if (!kategori) {
    throw new Error('Kategori tidak ditemukan.');
  }

  return serializeKategoriDoc(kategori.toObject());
}

export async function deleteKategoriService(
  userId: string,
  data: DeleteKategoriInput,
) {
  const transaksiMasihPakai = await hasKategoriTransactions(userId, data);

  if (transaksiMasihPakai) {
    throw new Error(
      'Kategori ini masih dipakai transaksi, jadi belum bisa dihapus.',
    );
  }

  const kategori = await deleteKategoriByIdAndUserId(userId, data);

  if (!kategori) {
    throw new Error('Kategori tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}
