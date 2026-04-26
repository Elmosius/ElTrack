import type { TransaksiPreviewItem } from '#/types/chatbot';
import {
  finalizePreviewItem,
  type ResolvedPreviewItemBase,
} from './chatbot-preview-item-resolver.server';

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
    confidenceNotes: [
      ...new Set([...currentItem.confidenceNotes, ...nextItem.confidenceNotes]),
    ],
  };

  return finalizePreviewItem(mergedBase);
}

function isBroadcastPatchItem(item: TransaksiPreviewItem) {
  return (
    Boolean(
      item.tanggal ||
        item.waktu ||
        item.kategoriName ||
        item.metodePembayaranName ||
        item.tipeName ||
        item.catatan,
    ) &&
    !item.namaTransaksi &&
    item.nominal == null
  );
}

function applyBroadcastPatch(
  currentItems: TransaksiPreviewItem[],
  patchItem: TransaksiPreviewItem,
) {
  return currentItems.map((currentItem) =>
    mergePreviewItemFields(currentItem, patchItem),
  );
}

export function mergePreviewItems(
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
