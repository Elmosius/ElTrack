import { listKategori } from '#/features/kategori/kategori.server';
import { listMetodePembayaran } from '#/features/metode-pembayaran/metode-pembayaran.server';
import { listTipe } from '#/features/tipe/tipe.server';
import type { ChatbotMasterData } from '../chatbot.shared.server';

export async function getChatbotMasterData(
  userId: string,
): Promise<ChatbotMasterData> {
  const [kategori, metodePembayaran, tipe] = await Promise.all([
    listKategori(userId),
    listMetodePembayaran(),
    listTipe(),
  ]);

  return {
    kategori: kategori.map((item) => ({ id: item._id, name: item.nama })),
    metodePembayaran: metodePembayaran.map((item) => ({
      id: String(item._id),
      name: item.nama,
    })),
    tipe: tipe.map((item) => ({ id: String(item._id), name: item.nama })),
  };
}
