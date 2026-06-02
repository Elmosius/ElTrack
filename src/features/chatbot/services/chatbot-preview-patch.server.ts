import type {
  TransaksiPreviewGroup,
  TransaksiPreviewItem,
} from '#/types/chatbot';
import type { PatchTransaksiPreviewItemInput } from '../chatbot.schema';
import { tipeNameSchema } from '../chatbot.schema';
import {
  cleanText,
  normalizeDate,
  parseNominal,
  uniq,
  type ChatbotMasterData,
  type NamedOption,
} from '../chatbot.shared.server';
import {
  buildGroupMissingFields,
  buildResolvedPreviewItem,
} from './chatbot-preview-item-resolver.server';

function findOptionById(
  options: NamedOption[],
  id: string | null | undefined,
  label: string,
) {
  if (!id) {
    return null;
  }

  const option = options.find((item) => item.id === id);

  if (!option) {
    throw new Error(`${label} tidak ditemukan.`);
  }

  return option;
}

function createEditablePreviewBase(item: TransaksiPreviewItem) {
  return {
    namaTransaksi: item.namaTransaksi,
    tanggal: item.tanggal,
    nominal: item.nominal,
    waktu: item.waktu,
    kategoriName: item.kategoriName,
    metodePembayaranName: item.metodePembayaranName,
    tipeName: item.tipeName,
    catatan: item.catatan,
    confidenceNotes: [],
  };
}

function applyPreviewItemPatch(
  item: TransaksiPreviewItem,
  patch: PatchTransaksiPreviewItemInput['patch'],
  masterData: ChatbotMasterData,
) {
  const previewBase = createEditablePreviewBase(item);

  if ('namaTransaksi' in patch) {
    previewBase.namaTransaksi = cleanText(patch.namaTransaksi);
  }

  if ('tanggal' in patch) {
    previewBase.tanggal = normalizeDate(patch.tanggal);
  }

  if ('nominal' in patch) {
    previewBase.nominal = parseNominal(patch.nominal);
  }

  if ('waktu' in patch) {
    previewBase.waktu = patch.waktu ?? null;
  }

  if ('kategoriId' in patch) {
    previewBase.kategoriName = findOptionById(
      masterData.kategori,
      patch.kategoriId,
      'Kategori',
    )?.name ?? null;
  }

  if ('metodePembayaranId' in patch) {
    previewBase.metodePembayaranName = findOptionById(
      masterData.metodePembayaran,
      patch.metodePembayaranId,
      'Kantong',
    )?.name ?? null;
  }

  if ('tipeId' in patch) {
    const tipe = findOptionById(masterData.tipe, patch.tipeId, 'Tipe');
    const parsedTipeName = tipeNameSchema.safeParse(tipe?.name ?? null);

    if (tipe && !parsedTipeName.success) {
      throw new Error('Tipe transaksi tidak valid.');
    }

    previewBase.tipeName = parsedTipeName.success ? parsedTipeName.data : null;
  }

  if ('catatan' in patch) {
    previewBase.catatan = cleanText(patch.catatan);
  }

  return buildResolvedPreviewItem(previewBase, masterData);
}

export function buildPatchedPreviewGroup(
  preview: TransaksiPreviewGroup,
  itemIndex: number,
  patch: PatchTransaksiPreviewItemInput['patch'],
  masterData: ChatbotMasterData,
): TransaksiPreviewGroup {
  const currentItem = preview.items[itemIndex];

  if (!currentItem) {
    throw new Error('Item preview transaksi tidak ditemukan.');
  }

  const items = preview.items.map((item, index) =>
    index === itemIndex ? applyPreviewItemPatch(item, patch, masterData) : item,
  );

  return {
    items,
    confidenceNotes: uniq(items.flatMap((item) => item.confidenceNotes)),
    missingFields: buildGroupMissingFields(items),
    canConfirm: items.length > 0 && items.every((item) => item.canConfirm),
  };
}
