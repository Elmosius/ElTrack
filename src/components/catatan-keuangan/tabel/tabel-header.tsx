import { Input } from '#/components/selia/input';
import { useTransactionTableHeader } from '#/hooks/transaction-table/use-transaction-table';
import { formatTransactionDate, getTodayDateString } from '#/lib/transaction-table';

export default function TabelHeader() {
  const { selectedDate, setSelectedDate } = useTransactionTableHeader();
  const isToday = selectedDate === getTodayDateString();

  return (
    <div className='flex items-start justify-between gap-3 border-b border-card-separator px-4 py-3'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Tabel Transaksi</p>
        <p className='text-xs text-dimmed'>
          {formatTransactionDate(selectedDate)}
          {isToday ? ' (hari ini)' : ''}
        </p>
      </div>

      <Input type='date' value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className='w-44 text-xs md:text-sm' aria-label='Filter tanggal transaksi' />
    </div>
  );
}
