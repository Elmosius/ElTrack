import { normalizeText } from '#/features/chatbot/chatbot.shared.server';
import type {
  KantongPageData,
  SerializedKantong,
} from '#/types/kantong';
import type {
  ArchiveKantongInput,
  CreateKantongInput,
  SetupDefaultKantongInput,
} from '../kantong.schema';
import { serializeKantongDoc } from '../mappers';
import {
  archiveKantongByIdAndUserId,
  findActiveKantongListByUserId,
  findKantongListByUserId,
  findKantongTransaksiByUserIdSince,
  insertKantong,
  unarchiveKantongByIdAndUserId,
} from '../repositories/kantong.repository.server';
import { buildKantongPageData } from './kantong-calculation.server';
import {
  ensureDefaultKantongsFromLegacyBalance,
  setupDefaultKantongsIfEmpty,
} from './kantong-defaults.service.server';
import {
  getEarliestActivationDate,
  getNamedRefId,
  getNamedRefName,
  isDuplicateKantongError,
  serializeKantongList,
} from './kantong-service-utils.server';

export async function setupDefaultKantongsService(
  userId: string,
  data: SetupDefaultKantongInput,
): Promise<KantongPageData> {
  await setupDefaultKantongsIfEmpty(userId, data);
  return getKantongPageDataService(userId);
}

export async function createKantongService(
  userId: string,
  data: CreateKantongInput,
): Promise<SerializedKantong> {
  const normalizedName = normalizeText(data.nama);

  if (!normalizedName) {
    throw new Error('Nama kantong wajib diisi.');
  }

  try {
    const kantong = await insertKantong(userId, normalizedName, data);
    return serializeKantongDoc(kantong.toObject());
  } catch (error) {
    if (isDuplicateKantongError(error)) {
      throw new Error('Nama Kantong sudah ada.');
    }

    throw error;
  }
}

export async function archiveKantongService(
  userId: string,
  data: ArchiveKantongInput,
): Promise<SerializedKantong> {
  const kantong = await archiveKantongByIdAndUserId(userId, data);

  if (!kantong) {
    throw new Error('Kantong tidak ditemukan.');
  }

  return serializeKantongDoc(kantong.toObject());
}

export async function unarchiveKantongService(
  userId: string,
  data: ArchiveKantongInput,
): Promise<SerializedKantong> {
  const kantong = await unarchiveKantongByIdAndUserId(userId, data);

  if (!kantong) {
    throw new Error('Kantong tidak ditemukan.');
  }

  return serializeKantongDoc(kantong.toObject());
}

export async function listActiveKantongService(
  userId: string,
): Promise<SerializedKantong[]> {
  await ensureDefaultKantongsFromLegacyBalance(userId);
  const list = await findActiveKantongListByUserId(userId);
  return serializeKantongList(list);
}

export async function getKantongPageDataService(
  userId: string,
): Promise<KantongPageData> {
  await ensureDefaultKantongsFromLegacyBalance(userId);
  const kantongs = serializeKantongList(await findKantongListByUserId(userId));

  if (kantongs.length === 0) {
    return buildKantongPageData([], []);
  }

  const transactions = await findKantongTransaksiByUserIdSince(
    userId,
    getEarliestActivationDate(kantongs),
  );

  return buildKantongPageData(
    kantongs,
    transactions.map((transaction) => ({
      nominal: transaction.nominal ?? 0,
      tipeName: getNamedRefName(transaction.tipe),
      kantongId: getNamedRefId(transaction.kantong),
      createdAt: transaction.createdAt,
    })),
  );
}
