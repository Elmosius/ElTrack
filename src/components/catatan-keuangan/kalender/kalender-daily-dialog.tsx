import { kalenderTexts } from '#/const/kalender';
import { useKalenderDailyDialog } from '#/hooks/use-kalender';
import { formatRupiah, formatTransactionDate } from '#/lib/transaction-table';
import { Button } from '@/components/selia/button';
import { Dialog, DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogTitle } from '@/components/selia/dialog';

export default function KalenderDailyDialog() {
  const { dialogDate, isDialogOpen, setIsDialogOpen, dailyTransactions, categoryMap, dailyTotal } = useKalenderDailyDialog();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle className={'text-base'}>{kalenderTexts.dailyTransactionTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription className={'text-sm'}>{formatTransactionDate(dialogDate || '')}</DialogDescription>
          <div className='rounded-md border border-secondary-border bg-card-footer px-3 py-2 text-xs text-dimmed'>
            Total: <span className='font-semibold text-foreground'>{formatRupiah(String(dailyTotal)) || 'Rp 0'}</span>
          </div>

          {dailyTransactions.length === 0 && <p className='text-sm text-dimmed'>{kalenderTexts.emptyDailyTransactions}</p>}

          {dailyTransactions.map((row) => (
            <div key={row.id} className='rounded-md border border-secondary-border bg-card px-3 py-2'>
              <p className='text-sm font-medium'>{row.namaTransaksi || kalenderTexts.unknownTransactionName}</p>
              <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-dimmed'>
                <span>{row.waktu}</span>
                <span>{categoryMap.get(row.kategoriId) || kalenderTexts.unknownCategory}</span>
                <span>{row.tipe}</span>
                <span>{row.metodePembayaran}</span>
              </div>
              <p className='mt-2 text-sm font-semibold'>{formatRupiah(row.nominal) || 'Rp 0'}</p>
              {row.catatan && <p className='mt-1 text-xs text-dimmed'>{row.catatan}</p>}
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant='plain' size='sm' className={'text-sm'}>
                {kalenderTexts.close}
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
