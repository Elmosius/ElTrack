import type {
  ChatbotPreviewEditOptions,
  TransaksiPreviewItem,
  TransaksiPreviewItemPatch,
  WaktuName,
} from '#/types/chatbot';
import {
  formatPreviewNominalInput,
  PreviewInputField,
  PreviewSelectField,
  PreviewTextareaField,
} from './chat-preview-edit-controls';
import { ChatPreviewInfoBox } from './chat-preview-info-box';
import { ChatPreviewStatusBadge } from './chat-preview-status-badge';
import { useChatPreviewItemDraft } from './use-chat-preview-item-draft';

type ChatPreviewItemCardProps = {
  item: TransaksiPreviewItem;
  index: number;
  options: ChatbotPreviewEditOptions | null;
  isPatching: boolean;
  onPatchItem: (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => Promise<boolean>;
  onDirtyChange: (itemIndex: number, isDirty: boolean) => void;
};

export function ChatPreviewItemCard({
  item,
  index,
  options,
  isPatching,
  onPatchItem,
  onDirtyChange,
}: ChatPreviewItemCardProps) {
  const { draft, updateDraft, saveField, saveSelectField } =
    useChatPreviewItemDraft({
      item,
      index,
      onPatchItem,
      onDirtyChange,
    });

  return (
    <div className='rounded-lg border border-card-separator bg-accent/30 px-2.5 py-2.5'>
      <div className='flex items-center justify-between gap-3'>
        <p className='font-medium text-foreground'>
          {index + 1}. {draft.namaTransaksi || 'Transaksi tanpa nama'}
        </p>
        <ChatPreviewStatusBadge
          isReady={item.canConfirm}
          readyLabel='Siap'
          pendingLabel='Perlu dicek'
        />
      </div>

      <div className='mt-3 grid gap-2 sm:grid-cols-2'>
        <PreviewInputField
          label='Nama transaksi'
          placeholder='Contoh: Isi bensin'
          value={draft.namaTransaksi}
          onChange={(value) => updateDraft('namaTransaksi', value)}
          onBlur={() =>
            void saveField('namaTransaksi', {
              namaTransaksi: draft.namaTransaksi || null,
            })
          }
        />
        <PreviewInputField
          label='Tanggal'
          type='date'
          value={draft.tanggal}
          onChange={(value) => updateDraft('tanggal', value)}
          onBlur={() =>
            void saveField('tanggal', { tanggal: draft.tanggal || null })
          }
        />
        <PreviewSelectField
          label='Waktu'
          value={draft.waktu}
          currentLabel={item.waktu}
          options={options?.waktu ?? []}
          placeholder='Pilih waktu'
          disabled={isPatching}
          onChange={(value) =>
            void saveSelectField('waktu', value, {
              waktu: value as WaktuName | null,
            })
          }
        />
        <PreviewInputField
          label='Nominal'
          inputMode='numeric'
          placeholder='Rp 0'
          value={formatPreviewNominalInput(draft.nominal)}
          onChange={(value) => updateDraft('nominal', value)}
          onBlur={() =>
            void saveField('nominal', { nominal: draft.nominal || null })
          }
        />
        <PreviewSelectField
          label='Kategori'
          value={draft.kategoriId}
          currentLabel={item.kategoriName}
          options={options?.kategori ?? []}
          placeholder='Pilih kategori'
          disabled={isPatching}
          onChange={(value) =>
            void saveSelectField('kategoriId', value, { kategoriId: value })
          }
        />
        <PreviewSelectField
          label='Kantong'
          value={draft.metodePembayaranId}
          currentLabel={item.metodePembayaranName}
          options={options?.kantong ?? []}
          placeholder='Pilih Kantong'
          disabled={isPatching}
          onChange={(value) =>
            void saveSelectField('metodePembayaranId', value, {
              metodePembayaranId: value,
            })
          }
        />
        <PreviewSelectField
          label='Tipe'
          value={draft.tipeId}
          currentLabel={item.tipeName}
          options={options?.tipe ?? []}
          placeholder='Pilih tipe'
          disabled={isPatching}
          onChange={(value) =>
            void saveSelectField('tipeId', value, { tipeId: value })
          }
        />
        <PreviewTextareaField
          label='Catatan'
          placeholder='Opsional'
          value={draft.catatan}
          onChange={(value) => updateDraft('catatan', value)}
          onBlur={() =>
            void saveField('catatan', { catatan: draft.catatan || null })
          }
        />
      </div>

      <ChatPreviewInfoBox
        title='Masih perlu dicek:'
        items={item.missingFields}
        tone='warning'
      />
    </div>
  );
}
