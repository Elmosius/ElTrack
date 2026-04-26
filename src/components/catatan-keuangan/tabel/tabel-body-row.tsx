import type { SelectOption, TransaksiRow } from '#/types/transaction-table';
import { Button } from '#/components/selia/button';
import { Input } from '#/components/selia/input';
import { TableCell, TableRow } from '#/components/selia/table';
import { Textarea } from '#/components/selia/textarea';
import { formatRupiah } from '#/lib/transaction-table';
import { Trash2 } from 'lucide-react';
import { CategoryPopover } from './category-popover';
import { MenuSelectField } from './menu-select-field';

type TabelBodyRowProps = {
  row: TransaksiRow;
  waktuOptions: readonly SelectOption[];
  metodePembayaranOptions: readonly SelectOption[];
  tipeOptions: readonly SelectOption[];
  waktuLabel?: string;
  metodePembayaranLabel?: string;
  tipeLabel?: string;
  updateRow: (rowId: string, patch: Partial<TransaksiRow>) => void;
  handleNominalChange: (rowId: string, value: string) => void;
  handleDeleteRow: (rowId: string) => Promise<void>;
  saveRow: (rowId: string) => Promise<void>;
};

const inputClassName =
  'h-8 shadow-none ring-0 bg-transparent px-0 text-sm placeholder:text-dimmed focus:ring-0 hover:not-data-disabled:not-focus:ring-0';

export function TabelBodyRow({
  row,
  waktuOptions,
  metodePembayaranOptions,
  tipeOptions,
  waktuLabel,
  metodePembayaranLabel,
  tipeLabel,
  updateRow,
  handleNominalChange,
  handleDeleteRow,
  saveRow,
}: TabelBodyRowProps) {
  const handleSelectChange = (
    field: 'waktuId' | 'metodePembayaranId' | 'tipeId',
    value: string,
  ) => {
    updateRow(row.id, { [field]: value });
    void saveRow(row.id);
  };

  return (
    <TableRow>
      <TableCell>
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
      </TableCell>

      <TableCell>
        <MenuSelectField
          value={row.waktuId}
          options={waktuOptions}
          displayValue={waktuLabel}
          onChange={(value) => handleSelectChange('waktuId', value)}
        />
      </TableCell>

      <TableCell>
        <Input
          value={formatRupiah(row.nominal)}
          onChange={(event) => handleNominalChange(row.id, event.target.value)}
          onBlur={() => void saveRow(row.id)}
          placeholder='Rp 0'
          variant='subtle'
          className={inputClassName}
        />
      </TableCell>

      <TableCell>
        <CategoryPopover row={row} />
      </TableCell>

      <TableCell>
        <MenuSelectField
          value={row.metodePembayaranId}
          options={metodePembayaranOptions}
          displayValue={metodePembayaranLabel}
          onChange={(value) =>
            handleSelectChange('metodePembayaranId', value)
          }
        />
      </TableCell>

      <TableCell>
        <Textarea
          value={row.catatan}
          variant='notion'
          onChange={(event) => updateRow(row.id, { catatan: event.target.value })}
          onBlur={() => void saveRow(row.id)}
          placeholder='Opsional'
          className='min-h-8 max-h-20 resize-y overflow-y-auto py-2 px-2 rounded-none text-sm'
        />
      </TableCell>

      <TableCell>
        <MenuSelectField
          value={row.tipeId}
          options={tipeOptions}
          displayValue={tipeLabel}
          onChange={(value) => handleSelectChange('tipeId', value)}
        />
      </TableCell>

      <TableCell className='text-center'>
        <Button
          onClick={() => void handleDeleteRow(row.id)}
          size='xs-icon'
          variant='plain'
          className='size-8 rounded text-muted hover:text-danger hover:bg-accent'
          aria-label='Hapus baris'
        >
          <Trash2 className='size-4' />
        </Button>
      </TableCell>
    </TableRow>
  );
}
