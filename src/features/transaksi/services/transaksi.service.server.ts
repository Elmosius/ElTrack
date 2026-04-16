import type {
  CreateTransaksiInput,
  DeleteTransaksiInput,
  UpdateTransaksiInput,
} from '../transaksi.schema';
import { serializeTransaksiDoc } from '../mappers';
import type { SerializedTransaksi } from '#/types/transaksi';
import {
  deleteTransaksiByIdAndUserId,
  findTransaksiListByUserId,
  insertTransaksi,
  updateTransaksiById,
} from '../repositories/transaksi.repository.server';

export async function listTransaksiService(
  userId: string,
): Promise<SerializedTransaksi[]> {
  const list = await findTransaksiListByUserId(userId);
  return list.map((item) => serializeTransaksiDoc(item));
}

export async function createTransaksiService(
  userId: string,
  data: CreateTransaksiInput,
): Promise<SerializedTransaksi> {
  const transaksi = await insertTransaksi(userId, data);
  return serializeTransaksiDoc(transaksi.toObject());
}

export async function updateTransaksiService(
  userId: string,
  data: UpdateTransaksiInput,
): Promise<SerializedTransaksi> {
  const transaksi = await updateTransaksiById(userId, data);

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return serializeTransaksiDoc(transaksi.toObject());
}

export async function deleteTransaksiService(
  userId: string,
  data: DeleteTransaksiInput,
) {
  const transaksi = await deleteTransaksiByIdAndUserId(userId, data);

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}
