import { listKategori } from '#/features/kategori/kategori.server';
import { listActiveKantong } from '#/features/kantong/kantong.server';
import { listTipe } from '#/features/tipe/tipe.server';
import { waktuOptionsStatic } from '#/lib/transaction-table';
import type { ChatbotPreviewEditOptions } from '#/types/chatbot';
import type { ChatbotMasterData } from '../chatbot.shared.server';

export async function getChatbotMasterData(
  userId: string,
): Promise<ChatbotMasterData> {
  const [kategori, kantong, tipe] = await Promise.all([
    listKategori(userId),
    listActiveKantong(userId),
    listTipe(),
  ]);

  return {
    kategori: kategori.map((item) => ({ id: item._id, name: item.nama })),
    metodePembayaran: kantong.map((item) => ({
      id: String(item._id),
      name: item.nama,
    })),
    tipe: tipe.map((item) => ({ id: String(item._id), name: item.nama })),
  };
}

export async function getChatbotPreviewEditOptionsService(
  userId: string,
): Promise<ChatbotPreviewEditOptions> {
  const masterData = await getChatbotMasterData(userId);

  return {
    waktu: waktuOptionsStatic.map((name) => ({ id: name, name })),
    kategori: masterData.kategori,
    kantong: masterData.metodePembayaran,
    tipe: masterData.tipe,
  };
}
