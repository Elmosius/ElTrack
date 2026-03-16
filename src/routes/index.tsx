import { Breadcrumb, BreadcrumbButton, BreadcrumbList, BreadcrumbSeparator } from '#/components/selia/breadcrumb';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <div className='flex flex-col gap-4'>
      <Breadcrumb>
        <BreadcrumbList className='text-sm'>
          <BreadcrumbButton>Home</BreadcrumbButton>
          <BreadcrumbSeparator />
          <BreadcrumbButton active>Catatan Keuangan</BreadcrumbButton>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className='text-2xl font-bold border border-secondary-border w-full h-100 rounded-lg'></h1>
    </div>
  );
}
