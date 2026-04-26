import { createTransaksi } from '#/features/transaksi/transaksi.server';
import { createAssistantMessage } from '#/lib/chatbot';
import type { ConfirmChatbotPreviewResult, TransaksiPreviewGroup, TransaksiPreviewItem } from '#/types/chatbot';
import { isMeaningfulPreviewItem, type ConfirmTransaksiPreviewInput, type PreviewTransaksiToolInput } from '../chatbot.schema';
import { getPendingPreview, uniq, type ChatbotMasterData } from '../chatbot.shared.server';
import { getChatSessionOrThrow, storeChatMessageForSession, updateChatSessionPendingPreviewService } from './chatbot-session.service.server';
import {
  buildRenameFallbackNames,
  resolveFallbackTransactionName,
} from './chatbot-preview-name-resolver.server';
import {
  buildGroupMissingFields,
  buildResolvedPreviewItem,
} from './chatbot-preview-item-resolver.server';
import { mergePreviewItems } from './chatbot-preview-merge.server';

type ConfirmableTransaksiPreviewItem = TransaksiPreviewItem & {
  namaTransaksi: string;
  tanggal: string;
  nominal: number;
  waktu: NonNullable<TransaksiPreviewItem['waktu']>;
  kategoriId: string;
  metodePembayaranId: string;
  tipeId: string;
};

type BuildResolvedPreviewOptions = {
  activePreview?: TransaksiPreviewGroup | null;
  latestUserMessage?: string | null;
};

export function buildResolvedPreview(args: PreviewTransaksiToolInput, masterData: ChatbotMasterData, options: BuildResolvedPreviewOptions = {}): TransaksiPreviewGroup {
  const { activePreview = null, latestUserMessage = null } = options;
  const fallbackTransactionName = resolveFallbackTransactionName(latestUserMessage, activePreview, args.items.length);
  const fallbackTransactionNames = buildRenameFallbackNames(latestUserMessage, activePreview, args.items.length);
  const nextResolvedItems = args.items.map((item, index) => buildResolvedPreviewItem(item, masterData, fallbackTransactionNames[index] ?? (index === 0 ? fallbackTransactionName : null))).filter((item) => isMeaningfulPreviewItem(item));
  const mergedItems = activePreview ? mergePreviewItems(activePreview.items, nextResolvedItems) : nextResolvedItems;
  const items = mergedItems.filter((item) => isMeaningfulPreviewItem(item));

  if (items.length === 0 && activePreview) {
    return activePreview;
  }

  const missingFields = buildGroupMissingFields(items);
  const confidenceNotes = uniq([...(activePreview?.confidenceNotes ?? []), ...(args.confidenceNotes ?? []), ...items.flatMap((item) => item.confidenceNotes)]);

  return {
    items,
    confidenceNotes,
    missingFields,
    canConfirm: items.length > 0 && items.every((item) => item.canConfirm),
  };
}

export async function confirmChatbotPreviewService(userId: string, input: ConfirmTransaksiPreviewInput): Promise<ConfirmChatbotPreviewResult> {
  const session = await getChatSessionOrThrow(userId, input.chatSessionId);
  const preview = getPendingPreview(session.pendingPreview);

  if (!preview || !preview.canConfirm || preview.items.length === 0) {
    throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
  }

  const confirmableItems: ConfirmableTransaksiPreviewItem[] = [];

  for (const item of preview.items) {
    if (!item.namaTransaksi || !item.tanggal || item.nominal == null || !item.waktu || !item.kategoriId || !item.metodePembayaranId || !item.tipeId) {
      throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
    }

    confirmableItems.push({
      ...item,
      namaTransaksi: item.namaTransaksi,
      tanggal: item.tanggal,
      nominal: item.nominal,
      waktu: item.waktu,
      kategoriId: item.kategoriId,
      metodePembayaranId: item.metodePembayaranId,
      tipeId: item.tipeId,
    });
  }

  for (const item of confirmableItems) {
    await createTransaksi(userId, {
      namaTransaksi: item.namaTransaksi,
      tanggal: item.tanggal,
      waktu: item.waktu,
      nominal: item.nominal,
      kategori: item.kategoriId,
      metodePembayaran: item.metodePembayaranId,
      catatan: item.catatan ?? undefined,
      tipe: item.tipeId,
    });
  }

  const assistantMessage = createAssistantMessage(preview.items.length > 1 ? `${preview.items.length} transaksi berhasil disimpan ke tabel.` : 'Transaksi berhasil disimpan ke tabel.');
  await storeChatMessageForSession(userId, input.chatSessionId, assistantMessage);
  const updatedSession = await updateChatSessionPendingPreviewService(userId, input.chatSessionId, null);

  return {
    assistantMessage,
    session: updatedSession,
  };
}

export async function dismissChatbotPreviewService(userId: string, chatSessionId: string) {
  const session = await updateChatSessionPendingPreviewService(userId, chatSessionId, null);

  return {
    session,
    cleared: true,
  };
}
