import { Button } from '#/components/selia/button';
import { Input } from '#/components/selia/input';
import { TableBody, TableCell, TableRow } from '#/components/selia/table';
import { Textarea } from '#/components/selia/textarea';
import { metodeOptions, tipeOptions, waktuOptions } from '#/const/transaction-table';
import { useTransactionTableBody } from '#/hooks/use-transaction-table';
import { formatRupiah } from '#/lib/transaction-table';
import { Trash2 } from 'lucide-react';
import { CategoryPopover } from './category-popover';
import { MenuSelectField } from './menu-select-field';

export default function TabelBody() {
  const { filteredRows, updateRow, handleNominalChange, handleDeleteRow } = useTransactionTableBody();

  return (
    <TableBody>
      {filteredRows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>
            <Input
              value={row.namaTransaksi}
              onChange={(event) => updateRow(row.id, { namaTransaksi: event.target.value })}
              placeholder='Nama / deskripsi transaksi'
              variant='subtle'
              className='h-8 shadow-none ring-0 bg-transparent px-0 text-sm placeholder:text-dimmed focus:ring-0 hover:not-data-disabled:not-focus:ring-0'
            />
          </TableCell>

          <TableCell>
            <MenuSelectField value={row.waktu} options={waktuOptions} onChange={(value) => updateRow(row.id, { waktu: value })} />
          </TableCell>

          <TableCell>
            <Input
              value={formatRupiah(row.nominal)}
              onChange={(event) => handleNominalChange(row.id, event.target.value)}
              placeholder='Rp 0'
              variant='subtle'
              className='h-8 shadow-none ring-0 bg-transparent px-0 text-sm placeholder:text-dimmed focus:ring-0 hover:not-data-disabled:not-focus:ring-0'
            />
          </TableCell>

          <TableCell>
            <CategoryPopover row={row} />
          </TableCell>

          <TableCell>
            <MenuSelectField value={row.metodePembayaran} options={metodeOptions} onChange={(value) => updateRow(row.id, { metodePembayaran: value })} />
          </TableCell>

          <TableCell>
            <Textarea
              value={row.catatan}
              variant='notion'
              onChange={(event) => updateRow(row.id, { catatan: event.target.value })}
              placeholder='Opsional'
              className='min-h-8 max-h-20 resize-y overflow-y-auto py-2 px-2 rounded-none text-sm'
            />
          </TableCell>

          <TableCell>
            <MenuSelectField value={row.tipe} options={tipeOptions} onChange={(value) => updateRow(row.id, { tipe: value })} />
          </TableCell>

          <TableCell className='text-center'>
            <Button onClick={() => handleDeleteRow(row.id)} size='xs-icon' variant='plain' className='size-8 rounded text-muted hover:text-danger hover:bg-accent' aria-label='Hapus baris'>
              <Trash2 className='size-4' />
            </Button>
          </TableCell>
        </TableRow>
      ))}

      {filteredRows.length === 0 && (
        <TableRow>
          <TableCell colSpan={8} className='w-full text-center text-sm text-dimmed'>
            Belum ada transaksi untuk tanggal ini.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
