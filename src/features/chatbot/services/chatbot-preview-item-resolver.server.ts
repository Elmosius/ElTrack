import type { TransaksiPreviewItem } from '#/types/chatbot';
import type { PreviewTransaksiToolInput } from '../chatbot.schema';
import {
  cleanText,
  findBestOptionMatch,
  normalizeDate,
  parseNominal,
  uniq,
  type ChatbotMasterData,
} from '../chatbot.shared.server';

export type ResolvedPreviewItemBase = Omit<
  TransaksiPreviewItem,
  'missingFields' | 'canConfirm'
>;

function buildMissingFields(preview: ResolvedPreviewItemBase) {
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
    missingFields.push(
      'Metode pembayaran belum cocok dengan daftar yang tersedia.',
    );
  }

  if (!preview.tipeId) {
    missingFields.push('Tipe transaksi belum cocok dengan daftar tipe yang tersedia.');
  }

  return missingFields;
}

export function finalizePreviewItem(
  previewBase: ResolvedPreviewItemBase,
): TransaksiPreviewItem {
  const missingFields = buildMissingFields(previewBase);

  return {
    ...previewBase,
    missingFields,
    canConfirm: missingFields.length === 0,
  };
}

export function buildResolvedPreviewItem(
  args: PreviewTransaksiToolInput['items'][number],
  masterData: ChatbotMasterData,
  fallbackTransactionName: string | null = null,
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
    namaTransaksi: cleanText(args.namaTransaksi) ?? fallbackTransactionName,
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

export function buildGroupMissingFields(items: TransaksiPreviewItem[]) {
  return uniq(
    items.flatMap((item, index) =>
      item.missingFields.map(
        (field) =>
          `${item.namaTransaksi || `Transaksi ${index + 1}`}: ${field}`,
      ),
    ),
  );
}
