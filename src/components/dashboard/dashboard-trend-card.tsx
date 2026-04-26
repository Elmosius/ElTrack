import { DashboardChart } from '#/components/dashboard/dashboard-chart';
import { Button } from '#/components/selia/button';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '#/components/selia/card';
import { dashboardTrendModes } from '#/const/dashboard';
import type { DashboardTrendPoint } from '#/types/dashboard';
import type { DashboardTrendMode } from '#/lib/dashboard';
import { createTrendChartOptions } from '#/lib/dashboard/chart';

type DashboardTrendCardProps = {
  mode: DashboardTrendMode;
  onModeChange: (mode: DashboardTrendMode) => void;
  trend: {
    weekly: DashboardTrendPoint[];
    monthly: DashboardTrendPoint[];
  };
};

export function DashboardTrendCard({ mode, onModeChange, trend }: DashboardTrendCardProps) {
  const activeData = mode === 'weekly' ? trend.weekly : trend.monthly;
  const labels = activeData.map((item) => item.label);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-base'>Tren Pengeluaran vs Penghasilan</CardTitle>
          <CardDescription className='text-sm'>Pantau ritme pemasukan dan pengeluaran dalam tampilan mingguan atau bulanan.</CardDescription>
        </div>
        <div className='flex items-center gap-2'>
          {dashboardTrendModes.map((item) => (
            <Button key={item.value} variant={mode === item.value ? 'primary' : 'outline'} size='xs' className={'text-xs ring-accent'} onClick={() => onModeChange(item.value)}>
              {item.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardBody className='p-4'>
        <DashboardChart
          type='line'
          height={320}
          options={createTrendChartOptions(labels)}
          series={[
            {
              name: 'Pengeluaran',
              data: activeData.map((item) => item.expenses),
            },
            {
              name: 'Penghasilan',
              data: activeData.map((item) => item.income),
            },
          ]}
        />
      </CardBody>
    </Card>
  );
}
