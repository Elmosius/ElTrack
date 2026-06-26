import { Card, CardBody } from '#/components/selia/card';
import type { LanggananSummary } from '#/types/langganan';
import { Bell, CalendarClock, CircleDollarSign, ReceiptText } from 'lucide-react';
import { formatLanggananCurrency } from './langganan-page.helpers';

type LanggananSummaryCardsProps = {
  summary: LanggananSummary;
};

const summaryItems = [
  {
    key: 'monthlyEstimate',
    label: 'Estimasi Bulanan',
    icon: CircleDollarSign,
    tone: 'text-primary',
  },
  {
    key: 'annualEstimate',
    label: 'Estimasi Tahunan',
    icon: ReceiptText,
    tone: 'text-info',
  },
  {
    key: 'dueSoonCount',
    label: 'Segera Jatuh Tempo',
    icon: Bell,
    tone: 'text-warning',
  },
  {
    key: 'overdueCount',
    label: 'Overdue',
    icon: CalendarClock,
    tone: 'text-danger',
  },
] as const;

export function LanggananSummaryCards({ summary }: LanggananSummaryCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {summaryItems.map((item) => {
        const Icon = item.icon;
        const value = summary[item.key];
        const displayValue =
          item.key === 'dueSoonCount' || item.key === 'overdueCount'
            ? `${value} langganan`
            : formatLanggananCurrency(value);

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
