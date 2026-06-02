import type {
  CreateTransaksiInput,
  DeleteTransaksiInput,
  UpdateTransaksiInput,
} from '../transaksi.schema';
import { serializeTransaksiDoc } from '../mappers';
import type { SerializedTransaksi } from '#/types/transaksi';
import { stringifyId } from '#/lib/serialization';
import { findKategoriByIdsAndUserId } from '#/features/kategori/repositories/kategori.repository.server';
import { findKantongByIdsAndUserId } from '#/features/kantong/repositories/kantong.repository.server';
import { findMetodePembayaranByIds } from '#/features/metode-pembayaran/repositories/metode-pembayaran.repository.server';
import { findTipeByIds } from '#/features/tipe/repositories/tipe.repository.server';
import type { ClientSession } from 'mongoose';
import {
  deleteTransaksiByIdAndUserId,
  findTransaksiListByUserId,
  insertTransaksi,
  insertTransaksiMany,
  updateTransaksiById,
} from '../repositories/transaksi.repository.server';

type ServiceOptions = {
  session?: ClientSession;
};

type TransaksiReferenceInput = Pick<
  CreateTransaksiInput,
  'kategori' | 'kantong' | 'metodePembayaran' | 'tipe'
>;

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function toIdSet(items: Array<{ _id: unknown }>) {
  return new Set(items.map((item) => stringifyId(item._id)));
}

async function ensureTransaksiReferencesExist(
  userId: string,
  list: TransaksiReferenceInput[],
) {
  const kategoriIds = unique(list.map((item) => item.kategori));
  const kantongIds = unique(list.map((item) => item.kantong));
  const metodePembayaranIds = unique(list.map((item) => item.metodePembayaran));
  const tipeIds = unique(list.map((item) => item.tipe));

  const [kategoriList, kantongList, metodePembayaranList, tipeList] = await Promise.all([
    findKategoriByIdsAndUserId(userId, kategoriIds),
    findKantongByIdsAndUserId(userId, kantongIds),
    findMetodePembayaranByIds(metodePembayaranIds),
    findTipeByIds(tipeIds),
  ]);

  const kategoriIdSet = toIdSet(kategoriList);
  const kantongIdSet = toIdSet(kantongList);
  const metodePembayaranIdSet = toIdSet(metodePembayaranList);
  const tipeIdSet = toIdSet(tipeList);

  if (kategoriIds.some((id) => !kategoriIdSet.has(id))) {
    throw new Error('Kategori tidak ditemukan.');
  }

  if (kantongIds.some((id) => !kantongIdSet.has(id))) {
    throw new Error('Kantong tidak ditemukan.');
  }

  if (metodePembayaranIds.some((id) => !metodePembayaranIdSet.has(id))) {
    throw new Error('Metode pembayaran tidak ditemukan.');
  }

  if (tipeIds.some((id) => !tipeIdSet.has(id))) {
    throw new Error('Tipe transaksi tidak ditemukan.');
  }
}

export async function listTransaksiService(
  userId: string,
): Promise<SerializedTransaksi[]> {
  const list = await findTransaksiListByUserId(userId);
  return list.map((item) => serializeTransaksiDoc(item));
}

export async function createTransaksiService(
  userId: string,
  data: CreateTransaksiInput,
  options: ServiceOptions = {},
): Promise<SerializedTransaksi> {
  await ensureTransaksiReferencesExist(userId, [data]);
  const transaksi = await insertTransaksi(userId, data, options);
  return serializeTransaksiDoc(transaksi.toObject());
}

export async function createManyTransaksiService(
  userId: string,
  list: CreateTransaksiInput[],
  options: ServiceOptions = {},
): Promise<SerializedTransaksi[]> {
  if (list.length === 0) {
    return [];
  }

  await ensureTransaksiReferencesExist(userId, list);
  const transaksiList = await insertTransaksiMany(userId, list, options);
  return transaksiList.map((transaksi) => serializeTransaksiDoc(transaksi.toObject()));
}

export async function updateTransaksiService(
  userId: string,
  data: UpdateTransaksiInput,
  options: ServiceOptions = {},
): Promise<SerializedTransaksi> {
  await ensureTransaksiReferencesExist(userId, [data]);
  const transaksi = await updateTransaksiById(userId, data, options);

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return serializeTransaksiDoc(transaksi.toObject());
}

export async function deleteTransaksiService(
  userId: string,
  data: DeleteTransaksiInput,
  options: ServiceOptions = {},
) {
  const transaksi = await deleteTransaksiByIdAndUserId(userId, data, options);

  if (!transaksi) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}
