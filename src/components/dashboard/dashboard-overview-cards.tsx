import { Card, CardBody } from '#/components/selia/card';
import { formatCurrency } from '#/lib/dashboard';
import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, WalletCards } from 'lucide-react';

type DashboardOverviewCardsProps = {
  overview: {
    balance: number;
    expenses: number;
    income: number;
    averageDailyExpense: number;
  };
};

const overviewItems = [
  {
    key: 'balance',
    label: 'Arus Bersih Bulan Ini',
    icon: WalletCards,
    tone: 'text-primary',
  },
  {
    key: 'expenses',
    label: 'Total Pengeluaran',
    icon: ArrowDownCircle,
    tone: 'text-danger',
  },
  {
    key: 'income',
    label: 'Total Penghasilan',
    icon: ArrowUpCircle,
    tone: 'text-primary',
  },
  {
    key: 'averageDailyExpense',
    label: 'Rata-rata Harian',
    icon: CircleDollarSign,
    tone: 'text-foreground',
  },
] as const;

export function DashboardOverviewCards({ overview }: DashboardOverviewCardsProps) {
  return (
    <div className='grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4'>
      {overviewItems.map((item) => {
        const Icon = item.icon;
        const value = overview[item.key];

        return (
          <Card key={item.key} className='overflow-hidden'>
            <CardBody className='flex items-start justify-between gap-2.5 p-3.5 md:gap-4 md:p-5'>
              <div className='min-w-0 space-y-1.5 md:space-y-2'>
                <p className='text-xs text-muted md:text-sm'>{item.label}</p>
                <p className='truncate text-sm font-semibold tracking-tight md:text-base'>{formatCurrency(value)}</p>
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
