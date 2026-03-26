import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/')({ component: App });

function App() {
  const list = [{ label: 'Home', to: '/', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />

      <div className='text-2xl font-bold border border-secondary-border w-full h-100 rounded-lg'></div>
    </div>
  );
}
