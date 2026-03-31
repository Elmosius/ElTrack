import { Input } from '#/components/selia/input';
import { formatMonthLabel } from '#/lib/dashboard';
import { CalendarDays } from 'lucide-react';

type DashboardHeaderProps = {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
};

export function DashboardHeader({ selectedMonth, onMonthChange }: DashboardHeaderProps) {
  return (
    <div className='flex w-full justify-between items-center gap-4 rounded-2xl bg-linear-to-br from-primary/10 via-card to-card p-5 ring ring-card-border'>
      <h1 className='text-xl font-semibold '>Ringkasan {formatMonthLabel(selectedMonth)}</h1>

      <div className='flex w-full flex-col gap-2 sm:w-56'>
        <label htmlFor='dashboard-month' className='inline-flex items-center gap-2 text-xs font-medium text-muted'>
          <CalendarDays className='size-3.5' />
          Pilih bulan
        </label>
        <Input id='dashboard-month' className={'text-sm'} type='month' value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)} />
      </div>
    </div>
  );
}
