import { DashboardChart } from '#/components/dashboard/dashboard-chart';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '#/components/selia/card';
import type { DashboardDistributionItem } from '#/types/dashboard';
import { createDonutChartOptions, createPaymentBarChartOptions } from '#/lib/dashboard/chart';

type DashboardDistributionChartsProps = {
  categoryDistribution: DashboardDistributionItem[];
  paymentMethodDistribution: DashboardDistributionItem[];
};

export function DashboardDistributionCharts({ categoryDistribution, paymentMethodDistribution }: DashboardDistributionChartsProps) {
  return (
    <div className='grid gap-4 xl:grid-cols-[1.15fr_1fr]'>
      <Card>
        <CardHeader>
          <div>
            <CardTitle className='text-base'>Distribusi Pengeluaran per Kategori</CardTitle>
            <CardDescription className='text-sm'>Lihat kategori mana yang paling banyak menyerap pengeluaranmu bulan ini.</CardDescription>
          </div>
        </CardHeader>
        <CardBody className='p-4'>
          <DashboardChart type='donut' height={320} options={createDonutChartOptions(categoryDistribution.map((item) => item.label))} series={categoryDistribution.map((item) => item.value)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className='text-base'>Pengeluaran per Kantong</CardTitle>
            <CardDescription className='text-sm'>Bandingkan Kantong yang paling sering dipakai untuk belanja.</CardDescription>
          </div>
        </CardHeader>
        <CardBody className='p-4'>
          <DashboardChart
            type='bar'
            height={320}
            options={createPaymentBarChartOptions(paymentMethodDistribution.map((item) => item.label))}
            series={[
              {
                name: 'Pengeluaran',
                data: paymentMethodDistribution.map((item) => item.value),
              },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
