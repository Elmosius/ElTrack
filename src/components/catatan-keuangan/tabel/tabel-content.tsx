import { useTransactionTableContent } from '#/hooks/use-transaction-table';
import { Button } from '@/components/selia/button';
import { Table, TableContainer, TableHead, TableHeader, TableRow } from '@/components/selia/table';
import { Plus } from 'lucide-react';
import TabelAlert from './tabel-alert';
import TabelBody from './tabel-body';
import TabelHeader from './tabel-header';

export default function TabelContent() {
  const { handleAddRow } = useTransactionTableContent();

  return (
    <>
      <TabelHeader />

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

          <TabelBody />
        </Table>
      </TableContainer>

      <div className='border-t border-card-separator px-4 py-2 bg-card-footer flex justify-center'>
        <Button size='sm' variant='outline' className={'text-sm'} onClick={handleAddRow}>
          <Plus className='size-4' />
          Tambah Baris
        </Button>
      </div>

      <TabelAlert />
    </>
  );
}
