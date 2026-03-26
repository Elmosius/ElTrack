import KalenderSection from '#/components/catatan-keuangan/kalender';
import TabelSection from '#/components/catatan-keuangan/tabel';
import { Tabs, TabsItem, TabsList, TabsPanel } from '@/components/selia/tabs';
import AppBreadCrumb from '@/components/shared/app-breadcrumb';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_app/catatan-keuangan')({
  component: RouteComponent,
});

function RouteComponent() {
  const list = [{ label: 'Catatan Keuangan', to: '/catatan-keuangan', active: true }];

  const [tab, setTab] = useState('tabel');

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsItem value='tabel' className={'text-sm'}>
            Tabel
          </TabsItem>
          <TabsItem value='kalender' className={'text-sm'}>
            Kalender
          </TabsItem>
        </TabsList>
        <TabsPanel value='tabel'>
          <TabelSection />
        </TabsPanel>
        <TabsPanel value='kalender'>
          <KalenderSection />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
