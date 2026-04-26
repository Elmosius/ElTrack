import type { TransaksiPreviewItem } from '#/types/chatbot';
import { ChatPreviewInfoBox } from './chat-preview-info-box';
import { ChatPreviewStatusBadge } from './chat-preview-status-badge';

type PreviewFieldProps = {
  label: string;
  value: string;
};

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div className='flex items-start justify-between gap-3 text-[11px] leading-4'>
      <span className='text-muted'>{label}</span>
      <span className='text-right text-foreground'>{value || '-'}</span>
    </div>
  );
}

function formatNominal(value: number | null) {
  return value != null
    ? `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
    : '-';
}

type ChatPreviewItemCardProps = {
  item: TransaksiPreviewItem;
  index: number;
};

export function ChatPreviewItemCard({
  item,
  index,
}: ChatPreviewItemCardProps) {
  return (
    <div className='rounded-lg border border-card-separator bg-accent/30 px-2.5 py-2.5'>
      <div className='flex items-center justify-between gap-3'>
        <p className='font-medium text-foreground'>
          {index + 1}. {item.namaTransaksi || 'Transaksi tanpa nama'}
        </p>
        <ChatPreviewStatusBadge
          isReady={item.canConfirm}
          readyLabel='Siap'
          pendingLabel='Perlu dicek'
        />
      </div>

      <div className='mt-2 space-y-2'>
        <PreviewField label='Tanggal' value={item.tanggal || '-'} />
        <PreviewField label='Waktu' value={item.waktu || '-'} />
        <PreviewField label='Nominal' value={formatNominal(item.nominal)} />
        <PreviewField label='Kategori' value={item.kategoriName || '-'} />
        <PreviewField
          label='Metode'
          value={item.metodePembayaranName || '-'}
        />
        <PreviewField label='Tipe' value={item.tipeName || '-'} />
        <PreviewField label='Catatan' value={item.catatan || '-'} />
      </div>

      <ChatPreviewInfoBox
        title='Masih perlu dicek:'
        items={item.missingFields}
        tone='warning'
      />
    </div>
  );
}
