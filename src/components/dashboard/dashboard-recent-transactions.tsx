import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '#/components/selia/card';
import type { DashboardRecentTransaction } from '#/types/dashboard';
import { formatCurrency } from '#/lib/dashboard';
import { cn } from '@/lib/utils';

type DashboardRecentTransactionsProps = {
  transactions: DashboardRecentTransaction[];
};

export function DashboardRecentTransactions({ transactions }: DashboardRecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-base'>Transaksi Terbaru</CardTitle>
          <CardDescription className='text-sm'>Lima transaksi terbaru di periode yang sedang kamu lihat.</CardDescription>
        </div>
      </CardHeader>
      <CardBody className='space-y-3'>
        {transactions.length === 0 ? (
          <div className='rounded-xl border border-dashed border-card-separator px-4 py-6 text-sm text-muted'>Belum ada transaksi terbaru di bulan ini.</div>
        ) : (
          transactions.map((item) => (
            <div key={item.id} className='flex items-start justify-between gap-4 rounded-xl border border-card-separator/80 px-4 py-3'>
              <div className='min-w-0 space-y-1'>
                <p className='truncate font-medium text-sm'>{item.namaTransaksi}</p>
                <div className='flex flex-wrap items-center gap-2 text-xs text-muted'>
                  <span>{item.kategoriName}</span>
                  <span className='text-border'>•</span>
                  <span>{item.waktu}</span>
                  <span className='text-border'>•</span>
                  <span>{item.tanggal}</span>
                </div>
              </div>

              <div className='flex shrink-0 flex-col items-end gap-2'>
                <span className={cn('rounded-full px-2 py-1 text-[11px] font-medium', item.tipeName === 'Pengeluaran' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary')}>{item.tipeName}</span>
                <p className='text-sm font-semibold'>{formatCurrency(item.nominal)}</p>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
