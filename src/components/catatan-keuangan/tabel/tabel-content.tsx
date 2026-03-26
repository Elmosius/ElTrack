import { metodeOptions, tipeOptions, waktuOptions } from '#/const/transaction-table';
import { useTransactionTable } from '#/hooks/use-transaction-table';
import { formatRupiah } from '#/lib/transaction-table';
import { AlertDialog, AlertDialogBody, AlertDialogClose, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogPopup, AlertDialogTitle } from '@/components/selia/alert-dialog';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/selia/table';
import { Textarea } from '@/components/selia/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { CategoryPopover } from './category-popover';
import { MenuSelectField } from './menu-select-field';

export default function TabelContent() {
  const { state, actions } = useTransactionTable();

  return (
    <div className='border border-secondary-border w-full h-full rounded-lg overflow-hidden bg-card flex flex-col'>
      <div className='flex items-center justify-between gap-3 border-b border-card-separator px-4 py-3'>
        <div>
          <p className='text-sm font-medium'>Tabel Transaksi</p>
        </div>
      </div>

      <TableContainer className='flex-1 overflow-x-auto overflow-y-auto'>
        <Table className='min-w-380 w-max md:w-auto h-full'>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='w-76 text-sm'>Nama Transaksi</TableHead>
              <TableHead className='w-40 text-sm'>Waktu</TableHead>
              <TableHead className='w-52 text-sm'>Nominal</TableHead>
              <TableHead className='w-64 text-sm'>Kategori</TableHead>
              <TableHead className='w-60 text-sm'>Metode Pembayaran</TableHead>
              <TableHead className='w-72 text-sm'>Catatan</TableHead>
              <TableHead className='w-44 text-sm'>Tipe</TableHead>
              <TableHead className='w-24 text-center text-sm'>Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {state.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    value={row.namaTransaksi}
                    onChange={(event) => actions.updateRow(row.id, { namaTransaksi: event.target.value })}
                    placeholder='Nama / deskripsi transaksi'
                    variant='subtle'
                    className='h-8 shadow-none ring-0 bg-transparent px-0 text-sm placeholder:text-dimmed focus:ring-0 hover:not-data-disabled:not-focus:ring-0'
                  />
                </TableCell>

                <TableCell>
                  <MenuSelectField value={row.waktu} options={waktuOptions} onChange={(value) => actions.updateRow(row.id, { waktu: value })} />
                </TableCell>

                <TableCell>
                  <Input
                    value={formatRupiah(row.nominal)}
                    onChange={(event) => actions.handleNominalChange(row.id, event.target.value)}
                    placeholder='Rp 0'
                    variant='subtle'
                    className='h-8 shadow-none ring-0 bg-transparent px-0 text-sm placeholder:text-dimmed focus:ring-0 hover:not-data-disabled:not-focus:ring-0'
                  />
                </TableCell>

                <TableCell>
                  <CategoryPopover row={row} />
                </TableCell>

                <TableCell>
                  <MenuSelectField value={row.metodePembayaran} options={metodeOptions} onChange={(value) => actions.updateRow(row.id, { metodePembayaran: value })} />
                </TableCell>

                <TableCell>
                  <Textarea
                    value={row.catatan}
                    variant='notion'
                    onChange={(event) => actions.updateRow(row.id, { catatan: event.target.value })}
                    placeholder='Opsional'
                    className='min-h-8 max-h-20 resize-y overflow-y-auto px-0 py-1 text-sm leading-5'
                  />
                </TableCell>

                <TableCell>
                  <MenuSelectField value={row.tipe} options={tipeOptions} onChange={(value) => actions.updateRow(row.id, { tipe: value })} />
                </TableCell>

                <TableCell className='text-center'>
                  <Button onClick={() => actions.handleDeleteRow(row.id)} size='xs-icon' variant='plain' className='size-8 rounded text-muted hover:text-danger hover:bg-accent' aria-label='Hapus baris'>
                    <Trash2 className='size-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className='border-t border-card-separator px-4 py-2 bg-card-footer flex justify-center'>
        <Button size='sm' variant='outline' className={'text-sm'} onClick={actions.handleAddRow}>
          <Plus className='size-4' />
          Tambah Baris
        </Button>
      </div>

      <AlertDialog open={state.isDeleteDialogOpen} onOpenChange={actions.setIsDeleteDialogOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Kategori <strong>{state.selectedCategory?.name || '-'}</strong> akan dihapus permanen dari daftar kategori.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose
              render={
                <Button variant='plain' size='sm'>
                  Batal
                </Button>
              }
              onClick={actions.clearDeleteTarget}
            />
            <AlertDialogClose
              render={
                <Button variant='danger' size='sm'>
                  Hapus
                </Button>
              }
              onClick={actions.confirmDeleteCategory}
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}
