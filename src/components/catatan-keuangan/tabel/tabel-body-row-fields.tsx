import { Button } from '#/components/selia/button';
import { Input } from '#/components/selia/input';
import { Textarea } from '#/components/selia/textarea';
import { formatRupiah } from '#/lib/transaction-table';
import type { TransaksiRow } from '#/types/transaction-table';
import { Trash2 } from 'lucide-react';

type EditableRowFieldProps = {
  row: TransaksiRow;
  updateRow: (rowId: string, patch: Partial<TransaksiRow>) => void;
  saveRow: (rowId: string) => Promise<void>;
};

type NominalFieldProps = Pick<EditableRowFieldProps, 'row' | 'saveRow'> & {
  handleNominalChange: (rowId: string, value: string) => void;
};

type DeleteRowButtonProps = {
  rowId: string;
  handleDeleteRow: (rowId: string) => Promise<void>;
};

const inputClassName =
  'h-8 shadow-none ring-0 bg-transparent px-0 text-sm placeholder:text-dimmed focus:ring-0 hover:not-data-disabled:not-focus:ring-0';

export function TransactionNameField({
  row,
  updateRow,
  saveRow,
}: EditableRowFieldProps) {
  return (
    <Input
      value={row.namaTransaksi}
      onChange={(event) =>
        updateRow(row.id, { namaTransaksi: event.target.value })
      }
      onBlur={() => void saveRow(row.id)}
      placeholder='Nama / deskripsi transaksi'
      variant='subtle'
      className={inputClassName}
    />
  );
}

export function NominalField({
  row,
  handleNominalChange,
  saveRow,
}: NominalFieldProps) {
  return (
    <Input
      value={formatRupiah(row.nominal)}
      onChange={(event) => handleNominalChange(row.id, event.target.value)}
      onBlur={() => void saveRow(row.id)}
      placeholder='Rp 0'
      variant='subtle'
      className={inputClassName}
    />
  );
}

export function NoteField({
  row,
  updateRow,
  saveRow,
}: EditableRowFieldProps) {
  return (
    <Textarea
      value={row.catatan}
      variant='notion'
      onChange={(event) => updateRow(row.id, { catatan: event.target.value })}
      onBlur={() => void saveRow(row.id)}
      placeholder='Opsional'
      className='min-h-8 max-h-20 resize-y overflow-y-auto py-2 px-2 rounded-none text-sm'
    />
  );
}

export function DeleteRowButton({
  rowId,
  handleDeleteRow,
}: DeleteRowButtonProps) {
  return (
    <Button
      onClick={() => void handleDeleteRow(rowId)}
      size='xs-icon'
      variant='plain'
      className='size-8 rounded text-muted hover:text-danger hover:bg-accent'
      aria-label='Hapus baris'
    >
      <Trash2 className='size-4' />
    </Button>
  );
}
