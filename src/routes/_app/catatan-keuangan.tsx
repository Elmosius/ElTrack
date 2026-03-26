import KalenderContent from '@/components/catatan-keuangan/kalender-content';
import TabelContent from '@/components/catatan-keuangan/tabel-content';
import { Tabs, TabsItem, TabsList, TabsPanel } from '@/components/selia/tabs';
import AppBreadCrumb from '@/components/shared/app-breadcrumb';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/catatan-keuangan')({
  component: RouteComponent,
});

function RouteComponent() {
  const list = [{ label: 'Catatan Keuangan', to: '/catatan-keuangan', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />

      <Tabs defaultValue='tabel'>
        <TabsList>
          <TabsItem value='tabel' className={'text-sm'}>
            Tabel
          </TabsItem>
          <TabsItem value='kalender' className={'text-sm'}>
            Kalender
          </TabsItem>
        </TabsList>
        <TabsPanel value='tabel'>
          <TabelContent />
        </TabsPanel>
        <TabsPanel value='kalender'>
          <KalenderContent />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
