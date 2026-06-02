import type {
  TransaksiPreviewItem,
  TransaksiPreviewItemPatch,
} from '#/types/chatbot';
import { useEffect, useRef, useState } from 'react';

export type PreviewDraft = {
  namaTransaksi: string;
  tanggal: string;
  nominal: string;
  waktu: string;
  kategoriId: string;
  metodePembayaranId: string;
  tipeId: string;
  catatan: string;
};

export type PreviewDraftField = keyof PreviewDraft;

type UseChatPreviewItemDraftOptions = {
  item: TransaksiPreviewItem;
  index: number;
  onPatchItem: (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => Promise<boolean>;
  onDirtyChange: (itemIndex: number, isDirty: boolean) => void;
};

function createPreviewDraft(item: TransaksiPreviewItem): PreviewDraft {
  return {
    namaTransaksi: item.namaTransaksi ?? '',
    tanggal: item.tanggal ?? '',
    nominal: item.nominal != null ? String(item.nominal) : '',
    waktu: item.waktu ?? '',
    kategoriId: item.kategoriId ?? '',
    metodePembayaranId: item.metodePembayaranId ?? '',
    tipeId: item.tipeId ?? '',
    catatan: item.catatan ?? '',
  };
}

export function useChatPreviewItemDraft({
  item,
  index,
  onPatchItem,
  onDirtyChange,
}: UseChatPreviewItemDraftOptions) {
  const [draft, setDraft] = useState(() => createPreviewDraft(item));
  const [, setDirtyFields] = useState<Set<PreviewDraftField>>(
    () => new Set(),
  );
  const dirtyFieldsRef = useRef<Set<PreviewDraftField>>(new Set());

  useEffect(() => {
    setDraft(createPreviewDraft(item));
    const nextDirtyFields = new Set<PreviewDraftField>();
    dirtyFieldsRef.current = nextDirtyFields;
    setDirtyFields(nextDirtyFields);
    onDirtyChange(index, false);
  }, [index, item, onDirtyChange]);

  useEffect(() => {
    return () => onDirtyChange(index, false);
  }, [index, onDirtyChange]);

  const updateDraft = (field: PreviewDraftField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    const next = new Set(dirtyFieldsRef.current);
    next.add(field);
    dirtyFieldsRef.current = next;
    setDirtyFields(next);
    onDirtyChange(index, next.size > 0);
  };

  const clearDirty = (field: PreviewDraftField) => {
    const next = new Set(dirtyFieldsRef.current);
    next.delete(field);
    dirtyFieldsRef.current = next;
    setDirtyFields(next);
    onDirtyChange(index, next.size > 0);
  };

  const saveField = async (
    field: PreviewDraftField,
    patch: TransaksiPreviewItemPatch,
  ) => {
    if (!dirtyFieldsRef.current.has(field)) {
      return;
    }

    if (await onPatchItem(index, patch)) {
      clearDirty(field);
    }
  };

  const saveSelectField = async (
    field: PreviewDraftField,
    value: string | null,
    patch: TransaksiPreviewItemPatch,
  ) => {
    updateDraft(field, value ?? '');

    if (await onPatchItem(index, patch)) {
      clearDirty(field);
    }
  };

  return {
    draft,
    updateDraft,
    saveField,
    saveSelectField,
  };
}
