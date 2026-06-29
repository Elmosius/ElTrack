import { Card, CardBody } from '#/components/selia/card';
import { formatCurrency } from '#/lib/dashboard';
import type { KantongPageData } from '#/types/kantong';
import { WalletCards } from 'lucide-react';

type KantongSummaryCardsProps = {
  data: KantongPageData;
};

export function KantongSummaryCards({ data }: KantongSummaryCardsProps) {
  const cards = [
    {
      label: 'Total Kantong',
      value: data.totalBalance,
      description: `${data.activeItems.length} Kantong aktif`,
    },
    {
      label: 'Cash',
      value: data.cashBalance,
      description: 'Agregasi Kantong cash',
    },
    {
      label: 'Non-cash',
      value: data.nonCashBalance,
      description: 'Agregasi bank dan e-wallet',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3'>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardBody className='flex items-start justify-between gap-2.5 p-3.5 md:gap-4 md:p-5'>
            <div className='min-w-0 space-y-1.5 md:space-y-2'>
              <p className='text-xs text-muted md:text-sm'>{card.label}</p>
              <p className='truncate text-sm font-semibold tracking-tight md:text-base'>
                {formatCurrency(card.value)}
              </p>
              <p className='text-xs text-muted'>{card.description}</p>
            </div>
            <div className='shrink-0 rounded-lg bg-accent p-2 text-primary md:rounded-xl md:p-2.5'>
              <WalletCards className='size-4 md:size-4.5' />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
