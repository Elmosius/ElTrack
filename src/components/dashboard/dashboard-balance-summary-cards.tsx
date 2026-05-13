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
    <div className='grid gap-4 lg:grid-cols-3'>
      {balanceCards.map((item) => {
        const Icon = item.icon;
        const value = balance[item.key];

        return (
          <Card key={item.key} className='overflow-hidden'>
            <CardBody className='flex items-start justify-between gap-4 p-5'>
              <div className='space-y-2'>
                <p className='text-sm text-muted'>{item.label}</p>
                <p className='font-semibold tracking-tight text-base'>
                  {formatCurrency(value)}
                </p>
                <p className='text-xs text-muted'>{item.description}</p>
              </div>
              <div className={`rounded-xl bg-accent p-2.5 ${item.tone}`}>
                <Icon className='size-4.5' />
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
