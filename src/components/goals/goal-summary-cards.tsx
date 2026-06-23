import { Card, CardBody } from '#/components/selia/card';
import type { GoalSummary } from '#/types/goals';
import { CircleDollarSign, Flag, PiggyBank, Target } from 'lucide-react';
import { formatGoalCurrency } from './goals-page.helpers';

type GoalSummaryCardsProps = {
  summary: GoalSummary;
};

const summaryItems = [
  {
    key: 'totalTarget',
    label: 'Total Target',
    icon: Target,
    tone: 'text-primary',
  },
  {
    key: 'totalCurrent',
    label: 'Terkumpul',
    icon: PiggyBank,
    tone: 'text-success',
  },
  {
    key: 'totalRemaining',
    label: 'Sisa Target',
    icon: CircleDollarSign,
    tone: 'text-warning',
  },
  {
    key: 'activeGoalCount',
    label: 'Goal Aktif',
    icon: Flag,
    tone: 'text-info',
  },
] as const;

export function GoalSummaryCards({ summary }: GoalSummaryCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {summaryItems.map((item) => {
        const Icon = item.icon;
        const value = summary[item.key];
        const displayValue =
          item.key === 'activeGoalCount'
            ? `${value} goal`
            : formatGoalCurrency(value);

        return (
          <Card key={item.key} className='overflow-hidden'>
            <CardBody className='flex items-start justify-between gap-4 p-5'>
              <div className='min-w-0 space-y-2'>
                <p className='text-sm text-muted'>{item.label}</p>
                <p className='truncate text-base font-semibold tracking-tight'>
                  {displayValue}
                </p>
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
