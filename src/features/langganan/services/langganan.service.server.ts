import { runWithOptionalTransaction } from '#/db/mongoose.server';
import {
  findKategoriByName,
  insertKategori,
} from '#/features/kategori/repositories/kategori.repository.server';
import { getKantongPageDataService } from '#/features/kantong/services/kantong.service.server';
import { findKantongByIdsAndUserId } from '#/features/kantong/repositories/kantong.repository.server';
import { createTransaksiService } from '#/features/transaksi/services/transaksi.service.server';
import { findTipeList } from '#/features/tipe/repositories/tipe.repository.server';
import { getTodayDateString } from '#/lib/transaction-table';
import type {
  LanggananPageData,
  SerializedLangganan,
} from '#/types/langganan';
import type {
  CreateLanggananInput,
  DeleteLanggananInput,
  PayLanggananInput,
  SetLanggananStatusInput,
  UpdateLanggananInput,
} from '../langganan.schema';
import { serializeLanggananDoc } from '../mappers';
import {
  deleteLanggananByIdAndUserId,
  findLanggananByIdAndUserId,
  findLanggananListByUserId,
  insertLangganan,
  markLanggananPaidById,
  setLanggananStatusById,
  updateLanggananById,
} from '../repositories/langganan.repository.server';
import {
  buildLanggananReminderItems,
  buildLanggananSummary,
  buildLanggananViewItems,
  calculateNextDueDate,
} from './langganan-calculation.server';
import { getLanggananPushStateService } from './langganan-push.service.server';

const langgananKategoriName = 'Langganan';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureLanggananReferencesExist(
  userId: string,
  data: Pick<CreateLanggananInput, 'kantong'>,
) {
  const kantongList = await findKantongByIdsAndUserId(userId, [data.kantong]);

  if (!kantongList[0]) {
    throw new Error('Kantong tidak ditemukan.');
  }
}

export async function ensureLanggananKategori(userId: string) {
  const namePattern = new RegExp(`^${escapeRegExp(langgananKategoriName)}$`, 'i');
  const existing = await findKategoriByName(userId, namePattern);

  if (existing) {
    return String(existing._id);
  }

  try {
    const created = await insertKategori(userId, { nama: langgananKategoriName });
    return String(created._id);
  } catch (error) {
    const fallback = await findKategoriByName(userId, namePattern);

    if (fallback) {
      return String(fallback._id);
    }

    throw error;
  }
}

async function getPengeluaranTipeId() {
  const tipeList = await findTipeList();
  const pengeluaran = tipeList.find((item) => item.nama === 'Pengeluaran');

  if (!pengeluaran) {
    throw new Error('Tipe Pengeluaran tidak ditemukan.');
  }

  return String(pengeluaran._id);
}

function buildLanggananTransactionName(item: SerializedLangganan) {
  return `Langganan ${item.nama}`;
}

export async function getLanggananPageDataService(
  userId: string,
): Promise<LanggananPageData> {
  const [langgananList, kantongData] = await Promise.all([
    findLanggananListByUserId(userId),
    getKantongPageDataService(userId),
  ]);
  const push = await getLanggananPushStateService(userId);
  const serializedItems = langgananList.map((item) => serializeLanggananDoc(item));
  const viewItems = buildLanggananViewItems({
    items: serializedItems,
    kantongs: kantongData.items,
  });

  return {
    items: viewItems,
    reminders: buildLanggananReminderItems(viewItems),
    summary: buildLanggananSummary(viewItems),
    kantongs: kantongData.activeItems,
    isKantongConfigured: kantongData.isConfigured,
    push,
  };
}

export async function createLanggananService(
  userId: string,
  data: CreateLanggananInput,
): Promise<SerializedLangganan> {
  await ensureLanggananReferencesExist(userId, data);
  const langganan = await insertLangganan(userId, data);
  return serializeLanggananDoc(langganan.toObject());
}

export async function updateLanggananService(
  userId: string,
  data: UpdateLanggananInput,
): Promise<SerializedLangganan> {
  await ensureLanggananReferencesExist(userId, data);
  const langganan = await updateLanggananById(userId, data);

  if (!langganan) {
    throw new Error('Langganan tidak ditemukan.');
  }

  return serializeLanggananDoc(langganan.toObject());
}

export async function setLanggananStatusService(
  userId: string,
  data: SetLanggananStatusInput,
): Promise<SerializedLangganan> {
  const langganan = await setLanggananStatusById(userId, data);

  if (!langganan) {
    throw new Error('Langganan tidak ditemukan.');
  }

  return serializeLanggananDoc(langganan.toObject());
}

export async function deleteLanggananService(
  userId: string,
  data: DeleteLanggananInput,
) {
  const langganan = await deleteLanggananByIdAndUserId(userId, data);

  if (!langganan) {
    throw new Error('Langganan tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}

export async function payLanggananService(
  userId: string,
  data: PayLanggananInput,
) {
  const existing = await findLanggananByIdAndUserId(data.id, userId);

  if (!existing) {
    throw new Error('Langganan tidak ditemukan.');
  }

  const serialized = serializeLanggananDoc(existing);

  if (serialized.status !== 'aktif') {
    throw new Error('Langganan dijeda. Aktifkan dulu sebelum mencatat pembayaran.');
  }

  const tipeId = await getPengeluaranTipeId();
  const kategoriId = await ensureLanggananKategori(userId);
  const paidAt = data.tanggal ?? getTodayDateString();
  const nextDueDate = calculateNextDueDate(
    serialized.nextDueDate,
    serialized.frequency,
  );

  return runWithOptionalTransaction(async (session) => {
    const transaksi = await createTransaksiService(
      userId,
      {
        namaTransaksi: buildLanggananTransactionName(serialized),
        tanggal: paidAt,
        waktu: 'Pagi',
        nominal: serialized.nominal,
        kategori: kategoriId,
        kantong: serialized.kantong,
        tipe: tipeId,
        catatan: serialized.catatan
          ? `Pembayaran langganan. ${serialized.catatan}`
          : 'Pembayaran langganan.',
        langgananId: serialized._id,
      },
      { session },
    );

    const updated = await markLanggananPaidById(
      userId,
      serialized._id,
      {
        nextDueDate,
        lastPaidAt: paidAt,
        lastTransactionId: transaksi._id,
      },
      { session },
    );

    if (!updated) {
      throw new Error('Langganan tidak ditemukan.');
    }

    return {
      langganan: serializeLanggananDoc(updated.toObject()),
      transaksi,
    };
  });
}
