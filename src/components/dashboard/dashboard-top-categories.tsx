import { Button } from '#/components/selia/button';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '#/components/selia/card';
import type { DashboardTopCategory } from '#/features/dashboard/dashboard.schema';
import { formatCurrency, formatSignedPercentage, getCategoryTrendTone } from '#/lib/dashboard';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

type DashboardTopCategoriesProps = {
  categories: DashboardTopCategory[];
  isEmpty: boolean;
};

export function DashboardTopCategories({ categories, isEmpty }: DashboardTopCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top Kategori</CardTitle>
          <CardDescription className='text-sm'>Kategori pengeluaran terbesar bulan ini beserta perbandingan dengan bulan sebelumnya.</CardDescription>
        </div>
      </CardHeader>
      <CardBody className='space-y-3'>
        {categories.length === 0 ? (
          <div className='space-y-4 rounded-xl border border-dashed border-card-separator px-4 py-6'>
            <p className='text-sm text-muted'>{isEmpty ? 'Belum ada transaksi di bulan ini. Tambahkan transaksi pertamamu untuk mulai melihat insight.' : 'Belum ada kategori pengeluaran yang bisa dibandingkan untuk periode ini.'}</p>
            {isEmpty ? (
              <Link to='/catatan-keuangan'>
                <Button size='sm'>
                  Tambah transaksi
                  <ArrowRight className='size-4' />
                </Button>
              </Link>
            ) : null}
          </div>
        ) : (
          categories.map((item, index) => (
            <div key={item.id} className='flex items-center justify-between gap-4 rounded-xl border border-card-separator/80 px-4 py-3'>
              <div className='space-y-1'>
                <p className='font-medium text-sm'>
                  {index + 1}. {item.name}
                </p>
                <p className='text-xs text-muted'>Bulan lalu: {formatCurrency(item.previousAmount)}</p>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-sm'>{formatCurrency(item.amount)}</p>
                <p className={`text-xs font-medium ${getCategoryTrendTone(item.trend)}`}>{formatSignedPercentage(item.percentageChange)}</p>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
