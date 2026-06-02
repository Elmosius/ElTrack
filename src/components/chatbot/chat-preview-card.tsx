import type {
  ChatbotPreviewEditOptions,
  TransaksiPreviewItemPatch,
  TransaksiPreviewGroup,
} from '#/types/chatbot';
import { isMeaningfulPreviewItem } from '#/features/chatbot/chatbot.schema';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../selia/button';
import { ChatPreviewInfoBox } from './chat-preview-info-box';
import { ChatPreviewItemCard } from './chat-preview-item-card';
import { ChatPreviewStatusBadge } from './chat-preview-status-badge';

type ChatPreviewCardProps = {
  preview: TransaksiPreviewGroup;
  previewOptions: ChatbotPreviewEditOptions | null;
  isConfirming: boolean;
  isPatching: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  onPatchItem: (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => Promise<boolean>;
};

export function ChatPreviewCard({
  preview,
  previewOptions,
  isConfirming,
  isPatching,
  onConfirm,
  onDismiss,
  onPatchItem,
}: ChatPreviewCardProps) {
  const [dirtyItemIndexes, setDirtyItemIndexes] = useState<Set<number>>(
    () => new Set(),
  );
  const visibleItems = preview.items.filter((item) =>
    isMeaningfulPreviewItem(item),
  );
  const hasUnsyncedEdits = dirtyItemIndexes.size > 0;
  const isPreviewSyncing = isPatching || hasUnsyncedEdits;

  useEffect(() => {
    setDirtyItemIndexes(new Set());
  }, [preview]);

  const handleDirtyChange = useCallback(
    (itemIndex: number, isDirty: boolean) => {
      setDirtyItemIndexes((current) => {
        const next = new Set(current);

        if (isDirty) {
          next.add(itemIndex);
        } else {
          next.delete(itemIndex);
        }

        return next;
      });
    },
    [],
  );

  return (
    <div className='rounded-xl border border-card-separator bg-card px-3 py-3 text-xs shadow-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='font-medium text-foreground'>
            Preview transaksi ({visibleItems.length})
          </p>
          <p className='mt-1 text-xs text-muted'>
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
            key={`preview-item-${index}`}
            item={item}
            index={index}
            options={previewOptions}
            isPatching={isPatching}
            onPatchItem={onPatchItem}
            onDirtyChange={handleDirtyChange}
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
          disabled={!preview.canConfirm || isConfirming || isPreviewSyncing}
          onClick={onConfirm}
        >
          {isPreviewSyncing
            ? 'Menyimpan edit...'
            : isConfirming
              ? 'Menyimpan...'
              : 'Konfirmasi simpan'}
        </Button>
      </div>
    </div>
  );
}
