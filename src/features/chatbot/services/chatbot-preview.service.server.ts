import { createAssistantMessage } from '#/lib/chatbot';
import { createTransaksi } from '#/features/transaksi/transaksi.server';
import type {
  ConfirmChatbotPreviewResult,
  ConfirmTransaksiPreviewInput,
  PreviewTransaksiToolInput,
  TransaksiPreviewGroup,
  TransaksiPreviewItem,
} from '../chatbot.schema';
import { isMeaningfulPreviewItem } from '../chatbot.schema';
import {
  cleanText,
  findBestOptionMatch,
  getPendingPreview,
  normalizeDate,
  parseNominal,
  uniq,
  type ChatbotMasterData,
} from '../chatbot.shared.server';
import { updateChatSessionPendingPreviewService, getChatSessionOrThrow, storeChatMessageForSession } from './chatbot-session.service.server';

type ConfirmableTransaksiPreviewItem = TransaksiPreviewItem & {
  namaTransaksi: string;
  tanggal: string;
  nominal: number;
  waktu: NonNullable<TransaksiPreviewItem['waktu']>;
  kategoriId: string;
  metodePembayaranId: string;
  tipeId: string;
};

type ResolvedPreviewItemBase = Omit<
  TransaksiPreviewItem,
  'missingFields' | 'canConfirm'
>;

function buildMissingFields(
  preview: ResolvedPreviewItemBase,
) {
  const missingFields: string[] = [];

  if (!preview.namaTransaksi) {
    missingFields.push('Nama transaksi belum terisi.');
  }

  if (!preview.tanggal) {
    missingFields.push('Tanggal transaksi belum terbaca.');
  }

  if (preview.nominal == null) {
    missingFields.push('Nominal transaksi belum terbaca.');
  }

  if (!preview.waktu) {
    missingFields.push('Waktu transaksi belum ditentukan.');
  }

  if (!preview.kategoriId) {
    missingFields.push('Kategori belum cocok dengan daftar kategori yang tersedia.');
  }

  if (!preview.metodePembayaranId) {
    missingFields.push('Metode pembayaran belum cocok dengan daftar yang tersedia.');
  }

  if (!preview.tipeId) {
    missingFields.push('Tipe transaksi belum cocok dengan daftar tipe yang tersedia.');
  }

  return missingFields;
}

function finalizePreviewItem(
  previewBase: ResolvedPreviewItemBase,
): TransaksiPreviewItem {
  const missingFields = buildMissingFields(previewBase);

  return {
    ...previewBase,
    missingFields,
    canConfirm: missingFields.length === 0,
  };
}

function buildResolvedPreviewItem(
  args: PreviewTransaksiToolInput['items'][number],
  masterData: ChatbotMasterData,
): TransaksiPreviewItem {
  const kategoriName = cleanText(args.kategoriName);
  const metodePembayaranName = cleanText(args.metodePembayaranName);
  const tipeName = args.tipeName ?? null;

  const matchedKategori = findBestOptionMatch(masterData.kategori, kategoriName);
  const matchedMetodePembayaran = findBestOptionMatch(
    masterData.metodePembayaran,
    metodePembayaranName,
  );
  const matchedTipe = findBestOptionMatch(masterData.tipe, tipeName);

  const previewBase: ResolvedPreviewItemBase = {
    namaTransaksi: cleanText(args.namaTransaksi),
    tanggal: normalizeDate(args.tanggal),
    nominal: parseNominal(args.nominal),
    waktu: args.waktu ?? null,
    kategoriName,
    kategoriId: matchedKategori?.id ?? null,
    metodePembayaranName,
    metodePembayaranId: matchedMetodePembayaran?.id ?? null,
    tipeName,
    tipeId: matchedTipe?.id ?? null,
    catatan: cleanText(args.catatan),
    confidenceNotes: uniq([
      ...(args.confidenceNotes ?? []),
      kategoriName && !matchedKategori
        ? `Kategori "${kategoriName}" belum cocok dengan daftar kategori yang tersedia.`
        : null,
      metodePembayaranName && !matchedMetodePembayaran
        ? `Metode pembayaran "${metodePembayaranName}" belum cocok dengan daftar metode pembayaran yang tersedia.`
        : null,
      tipeName && !matchedTipe
        ? `Tipe "${tipeName}" belum cocok dengan daftar tipe yang tersedia.`
        : null,
    ]),
  };

  return finalizePreviewItem(previewBase);
}

function buildGroupMissingFields(items: TransaksiPreviewItem[]) {
  return uniq(
    items.flatMap((item, index) =>
      item.missingFields.map(
        (field) =>
          `${item.namaTransaksi || `Transaksi ${index + 1}`}: ${field}`,
      ),
    ),
  );
}

function mergePreviewItemFields(
  currentItem: TransaksiPreviewItem | null,
  nextItem: TransaksiPreviewItem,
) {
  if (!currentItem) {
    return nextItem;
  }

  const mergedBase: ResolvedPreviewItemBase = {
    namaTransaksi: nextItem.namaTransaksi ?? currentItem.namaTransaksi,
    tanggal: nextItem.tanggal ?? currentItem.tanggal,
    nominal: nextItem.nominal ?? currentItem.nominal,
    waktu: nextItem.waktu ?? currentItem.waktu,
    kategoriName: nextItem.kategoriName ?? currentItem.kategoriName,
    kategoriId: nextItem.kategoriId ?? currentItem.kategoriId,
    metodePembayaranName:
      nextItem.metodePembayaranName ?? currentItem.metodePembayaranName,
    metodePembayaranId:
      nextItem.metodePembayaranId ?? currentItem.metodePembayaranId,
    tipeName: nextItem.tipeName ?? currentItem.tipeName,
    tipeId: nextItem.tipeId ?? currentItem.tipeId,
    catatan: nextItem.catatan ?? currentItem.catatan,
    confidenceNotes: uniq([
      ...currentItem.confidenceNotes,
      ...nextItem.confidenceNotes,
    ]),
  };

  return finalizePreviewItem(mergedBase);
}

function isBroadcastPatchItem(item: TransaksiPreviewItem) {
  return Boolean(
    item.tanggal ||
      item.waktu ||
      item.kategoriName ||
      item.metodePembayaranName ||
      item.tipeName ||
      item.catatan,
  ) && !item.namaTransaksi && item.nominal == null;
}

function applyBroadcastPatch(
  currentItems: TransaksiPreviewItem[],
  patchItem: TransaksiPreviewItem,
) {
  return currentItems.map((currentItem) =>
    mergePreviewItemFields(currentItem, patchItem),
  );
}

function mergePreviewItems(
  currentItems: TransaksiPreviewItem[],
  nextItems: TransaksiPreviewItem[],
) {
  if (
    currentItems.length > 1 &&
    nextItems.length === 1 &&
    isBroadcastPatchItem(nextItems[0] as TransaksiPreviewItem)
  ) {
    return applyBroadcastPatch(
      currentItems,
      nextItems[0] as TransaksiPreviewItem,
    );
  }

  const mergedItems: TransaksiPreviewItem[] = [];
  const maxLength = Math.max(currentItems.length, nextItems.length);

  for (let index = 0; index < maxLength; index += 1) {
    const currentItem = currentItems[index] ?? null;
    const nextItem = nextItems[index] ?? null;

    if (currentItem && nextItem) {
      mergedItems.push(mergePreviewItemFields(currentItem, nextItem));
      continue;
    }

    if (nextItem) {
      mergedItems.push(nextItem);
      continue;
    }

    if (currentItem) {
      mergedItems.push(currentItem);
    }
  }

  return mergedItems;
}

export function buildResolvedPreview(
  args: PreviewTransaksiToolInput,
  masterData: ChatbotMasterData,
  activePreview: TransaksiPreviewGroup | null = null,
): TransaksiPreviewGroup {
  const nextResolvedItems = args.items
    .map((item) => buildResolvedPreviewItem(item, masterData))
    .filter((item) => isMeaningfulPreviewItem(item));
  const mergedItems = activePreview
    ? mergePreviewItems(activePreview.items, nextResolvedItems)
    : nextResolvedItems;
  const items = mergedItems.filter((item) => isMeaningfulPreviewItem(item));

  if (items.length === 0 && activePreview) {
    return activePreview;
  }

  const missingFields = buildGroupMissingFields(items);
  const confidenceNotes = uniq([
    ...(activePreview?.confidenceNotes ?? []),
    ...(args.confidenceNotes ?? []),
    ...items.flatMap((item) => item.confidenceNotes),
  ]);

  return {
    items,
    confidenceNotes,
    missingFields,
    canConfirm: items.length > 0 && items.every((item) => item.canConfirm),
  };
}

export async function confirmChatbotPreviewService(
  userId: string,
  input: ConfirmTransaksiPreviewInput,
): Promise<ConfirmChatbotPreviewResult> {
  const session = await getChatSessionOrThrow(userId, input.chatSessionId);
  const preview = getPendingPreview(session.pendingPreview);

  if (!preview || !preview.canConfirm || preview.items.length === 0) {
    throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
  }

  const confirmableItems: ConfirmableTransaksiPreviewItem[] = [];

  for (const item of preview.items) {
    if (
      !item.namaTransaksi ||
      !item.tanggal ||
      item.nominal == null ||
      !item.waktu ||
      !item.kategoriId ||
      !item.metodePembayaranId ||
      !item.tipeId
    ) {
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

  const assistantMessage = createAssistantMessage(
    preview.items.length > 1
      ? `${preview.items.length} transaksi berhasil disimpan ke tabel.`
      : 'Transaksi berhasil disimpan ke tabel.',
  );
  await storeChatMessageForSession(userId, input.chatSessionId, assistantMessage);
  const updatedSession = await updateChatSessionPendingPreviewService(
    userId,
    input.chatSessionId,
    null,
  );

  return {
    assistantMessage,
    session: updatedSession,
  };
}

export async function dismissChatbotPreviewService(
  userId: string,
  chatSessionId: string,
) {
  const session = await updateChatSessionPendingPreviewService(
    userId,
    chatSessionId,
    null,
  );

  return {
    session,
    cleared: true,
  };
}
