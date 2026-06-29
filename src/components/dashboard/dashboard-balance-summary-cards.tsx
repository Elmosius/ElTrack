import { Card, CardBody } from '#/components/selia/card';
import { formatCurrency } from '#/lib/dashboard';
import type { BalanceSummary } from '#/types/balance';
import { balanceCards } from './dashboard-balance.helpers';

type DashboardBalanceSummaryCardsProps = {
  balance: BalanceSummary;
};

export function DashboardBalanceSummaryCards({
  balance,
}: DashboardBalanceSummaryCardsProps) {
  return (
    <div className='grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3'>
      {balanceCards.map((item) => {
        const Icon = item.icon;
        const value = balance[item.key];

        return (
          <Card key={item.key} className='overflow-hidden'>
            <CardBody className='flex items-start justify-between gap-2.5 p-3.5 md:gap-4 md:p-5'>
              <div className='min-w-0 space-y-1.5 md:space-y-2'>
                <p className='text-xs text-muted md:text-sm'>{item.label}</p>
                <p className='truncate text-sm font-semibold tracking-tight md:text-base'>
                  {formatCurrency(value)}
                </p>
                <p className='text-xs text-muted'>{item.description}</p>
              </div>
              <div className={`shrink-0 rounded-lg bg-accent p-2 md:rounded-xl md:p-2.5 ${item.tone}`}>
                <Icon className='size-4 md:size-4.5' />
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
