import type {
  TransaksiPreviewGroup,
  TransaksiPreviewItem,
} from '#/types/chatbot';
import { isMeaningfulPreviewItem } from '#/features/chatbot/chatbot.schema';
import { Button } from '../selia/button';

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

type PreviewItemCardProps = {
  item: TransaksiPreviewItem;
  index: number;
};

function PreviewItemCard({ item, index }: PreviewItemCardProps) {
  return (
    <div className='rounded-lg border border-card-separator bg-accent/30 px-2.5 py-2.5'>
      <div className='flex items-center justify-between gap-3'>
        <p className='font-medium text-foreground'>
          {index + 1}. {item.namaTransaksi || 'Transaksi tanpa nama'}
        </p>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-medium ${
            item.canConfirm
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}
        >
          {item.canConfirm ? 'Siap' : 'Perlu dicek'}
        </span>
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

      {item.missingFields.length > 0 ? (
        <div className='mt-3 rounded-lg border border-warning/25 bg-warning/8 px-2.5 py-2 text-[11px] text-warning'>
          <p className='font-medium'>Masih perlu dicek:</p>
          <ul className='mt-1 list-disc pl-4'>
            {item.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

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
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-medium ${
            preview.canConfirm
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}
        >
          {preview.canConfirm ? 'Siap disimpan' : 'Perlu dicek'}
        </span>
      </div>

      <div className='mt-3 space-y-2'>
        {visibleItems.map((item, index) => (
          <PreviewItemCard
            key={`${item.namaTransaksi || 'transaksi'}-${index}`}
            item={item}
            index={index}
          />
        ))}
      </div>

      {preview.missingFields.length > 0 ? (
        <div className='mt-3 rounded-lg border border-warning/25 bg-warning/8 px-2.5 py-2 text-[11px] text-warning'>
          <p className='font-medium'>Ringkasan yang masih perlu dicek:</p>
          <ul className='mt-1 list-disc pl-4'>
            {preview.missingFields.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview.confidenceNotes.length > 0 ? (
        <div className='mt-3 rounded-lg border border-card-separator bg-accent/70 px-2.5 py-2 text-[11px] text-muted'>
          <p className='font-medium text-foreground'>Catatan AI:</p>
          <ul className='mt-1 list-disc pl-4'>
            {preview.confidenceNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

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
