import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/catatan-keuangan')({
  component: RouteComponent,
});

function RouteComponent() {
  const list = [{ label: 'Catatan Keuangan', to: '/catatan-keuangan', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />

      <div className='text-2xl font-bold border border-secondary-border w-full h-100 rounded-lg'>
        
      </div>
    </div>
  );
}
