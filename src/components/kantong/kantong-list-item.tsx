import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import { formatCurrency } from '#/lib/dashboard';
import type { KantongSummaryItem } from '#/types/kantong';
import { Archive, RotateCcw } from 'lucide-react';
import { bucketLabel } from './kantong-page.helpers';
import { useKantongArchiveAction } from './use-kantong-archive-action';

type KantongListItemProps = {
  item: KantongSummaryItem;
};

export function KantongListItem({ item }: KantongListItemProps) {
  const { isMutating, handleArchiveToggle } = useKantongArchiveAction(item);
  const ActionIcon = item.isArchived ? RotateCcw : Archive;

  return (
    <Card className={item.isArchived ? 'border-dashed opacity-80' : undefined}>
      <CardBody className='space-y-4 p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-2'>
            <p className='truncate font-semibold'>{item.nama}</p>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='rounded-full bg-accent px-2 py-1 text-xs text-muted'>
                {bucketLabel(item.bucket)}
              </span>
              {item.isArchived && (
                <span className='rounded-full bg-muted/10 px-2 py-1 text-xs text-muted'>
                  Diarsipkan
                </span>
              )}
            </div>
          </div>
          <Button
            size='xs-icon'
            variant='plain'
            disabled={isMutating}
            progress={isMutating}
            onClick={handleArchiveToggle}
            aria-label={
              item.isArchived
                ? `Aktifkan kembali ${item.nama}`
                : `Arsipkan ${item.nama}`
            }
          >
            <ActionIcon className='size-4' />
          </Button>
        </div>

        <div className='space-y-1'>
          <p className='text-xs text-muted'>Saldo aktual</p>
          <p className='font-semibold'>{formatCurrency(item.currentBalance)}</p>
        </div>

        <div className='grid grid-cols-3 gap-2 rounded-2xl bg-accent/50 p-3 text-xs text-muted'>
          <div className='space-y-1'>
            <p>Saldo awal</p>
            <p className='font-medium text-foreground'>
              {formatCurrency(item.openingBalance)}
            </p>
          </div>
          <div className='space-y-1'>
            <p>Masuk</p>
            <p className='font-medium text-foreground'>
              {formatCurrency(item.income)}
            </p>
          </div>
          <div className='space-y-1'>
            <p>Keluar</p>
            <p className='font-medium text-foreground'>
              {formatCurrency(item.expenses)}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
