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
    label: 'Total Saldo',
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
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {overviewItems.map((item) => {
        const Icon = item.icon;
        const value = overview[item.key];

        return (
          <Card key={item.key} className='overflow-hidden'>
            <CardBody className='flex items-start justify-between gap-4 p-5'>
              <div className='space-y-2'>
                <p className='text-sm text-muted'>{item.label}</p>
                <p className='font-semibold tracking-tight text-base'>{formatCurrency(value)}</p>
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
