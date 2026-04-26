import type {
  TransaksiPreviewGroup,
} from '#/types/chatbot';
import { isMeaningfulPreviewItem } from '#/features/chatbot/chatbot.schema';
import { Button } from '../selia/button';
import { ChatPreviewInfoBox } from './chat-preview-info-box';
import { ChatPreviewItemCard } from './chat-preview-item-card';
import { ChatPreviewStatusBadge } from './chat-preview-status-badge';

type ChatPreviewCardProps = {
  preview: TransaksiPreviewGroup;
  isConfirming: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function ChatPreviewCard({
  preview,
  isConfirming,
  onConfirm,
  onDismiss,
}: ChatPreviewCardProps) {
  const visibleItems = preview.items.filter((item) =>
    isMeaningfulPreviewItem(item),
  );

  return (
    <div className='rounded-xl border border-card-separator bg-card px-3 py-3 text-xs shadow-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='font-medium text-foreground'>
            Preview transaksi ({visibleItems.length})
          </p>
          <p className='mt-1 text-[10px] text-muted'>
            Cek dulu sebelum disimpan ke tabel.
          </p>
        </div>
        <ChatPreviewStatusBadge
          isReady={preview.canConfirm}
          readyLabel='Siap disimpan'
          pendingLabel='Perlu dicek'
        />
      </div>

      <div className='mt-3 space-y-2'>
        {visibleItems.map((item, index) => (
          <ChatPreviewItemCard
            key={`${item.namaTransaksi || 'transaksi'}-${index}`}
            item={item}
            index={index}
          />
        ))}
      </div>

      <ChatPreviewInfoBox
        title='Ringkasan yang masih perlu dicek:'
        items={preview.missingFields}
        tone='warning'
      />

      <ChatPreviewInfoBox
        title='Catatan AI:'
        items={preview.confidenceNotes}
        tone='neutral'
      />

      <div className='mt-3 flex items-center justify-end gap-2'>
        <Button
          size='sm'
          variant='plain'
          className='ring-0 text-xs'
          onClick={onDismiss}
        >
          Batal
        </Button>
        <Button
          size='sm'
          variant='primary'
          className='ring-0 text-xs'
          disabled={!preview.canConfirm || isConfirming}
          onClick={onConfirm}
        >
          {isConfirming ? 'Menyimpan...' : 'Konfirmasi simpan'}
        </Button>
      </div>
    </div>
  );
}
