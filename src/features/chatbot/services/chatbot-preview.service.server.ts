import { createAssistantMessage } from '#/lib/chatbot';
import { createTransaksi } from '#/features/transaksi/transaksi.server';
import type {
  ConfirmChatbotPreviewResult,
  ConfirmTransaksiPreviewInput,
  PreviewTransaksiToolInput,
  TransaksiPreview,
} from '../chatbot.schema';
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

function buildMissingFields(
  preview: Omit<TransaksiPreview, 'missingFields' | 'canConfirm'>,
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

export function buildResolvedPreview(
  args: PreviewTransaksiToolInput,
  masterData: ChatbotMasterData,
): TransaksiPreview {
  const kategoriName = cleanText(args.kategoriName);
  const metodePembayaranName = cleanText(args.metodePembayaranName);
  const tipeName = args.tipeName ?? null;

  const matchedKategori = findBestOptionMatch(masterData.kategori, kategoriName);
  const matchedMetodePembayaran = findBestOptionMatch(
    masterData.metodePembayaran,
    metodePembayaranName,
  );
  const matchedTipe = findBestOptionMatch(masterData.tipe, tipeName);

  const previewBase = {
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
  } satisfies Omit<TransaksiPreview, 'missingFields' | 'canConfirm'>;

  const missingFields = buildMissingFields(previewBase);

  return {
    ...previewBase,
    missingFields,
    canConfirm: missingFields.length === 0,
  };
}

export async function confirmChatbotPreviewService(
  userId: string,
  input: ConfirmTransaksiPreviewInput,
): Promise<ConfirmChatbotPreviewResult> {
  const session = await getChatSessionOrThrow(userId, input.chatSessionId);
  const preview = getPendingPreview(session.pendingPreview);

  if (!preview || !preview.canConfirm) {
    throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
  }

  if (
    !preview.namaTransaksi ||
    !preview.tanggal ||
    preview.nominal == null ||
    !preview.waktu ||
    !preview.kategoriId ||
    !preview.metodePembayaranId ||
    !preview.tipeId
  ) {
    throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
  }

  await createTransaksi(userId, {
    namaTransaksi: preview.namaTransaksi,
    tanggal: preview.tanggal,
    waktu: preview.waktu,
    nominal: preview.nominal,
    kategori: preview.kategoriId,
    metodePembayaran: preview.metodePembayaranId,
    catatan: preview.catatan ?? undefined,
    tipe: preview.tipeId,
  });

  const assistantMessage = createAssistantMessage(
    'Transaksi berhasil disimpan ke tabel.',
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
