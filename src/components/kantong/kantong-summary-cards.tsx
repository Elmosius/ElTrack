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
    <div className='grid gap-4 lg:grid-cols-3'>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardBody className='flex items-start justify-between gap-4 p-5'>
            <div className='space-y-2'>
              <p className='text-sm text-muted'>{card.label}</p>
              <p className='font-semibold tracking-tight text-base'>
                {formatCurrency(card.value)}
              </p>
              <p className='text-xs text-muted'>{card.description}</p>
            </div>
            <div className='rounded-xl bg-accent p-2.5 text-primary'>
              <WalletCards className='size-4.5' />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
