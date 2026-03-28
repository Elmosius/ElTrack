import KalenderSection from '#/components/catatan-keuangan/kalender';
import TabelSection from '#/components/catatan-keuangan/tabel';
import { getListKategori } from '#/features/kategori/kategori.functions';
import { getListMetodePembayaran } from '#/features/metode-pembayaran/metode-pembayaran.functions';
import { getListTipe } from '#/features/tipe/tipe.functions';
import { getListTransaksi } from '#/features/transaksi/transaksi.functions';
import { getListWaktu } from '#/features/waktu/waktu.functions';
import { Tabs, TabsItem, TabsList, TabsPanel } from '@/components/selia/tabs';
import AppBreadCrumb from '@/components/shared/app-breadcrumb';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_app/catatan-keuangan')({
  component: RouteComponent,
  loader: async () => {
    const listWaktu = await getListWaktu();
    const listTipe = await getListTipe();
    const listKategori = await getListKategori();
    const listMetodePembayaran = await getListMetodePembayaran();
    const listTransaksi = await getListTransaksi();

    return { listWaktu, listTipe, listKategori, listMetodePembayaran, listTransaksi };
  },
});

function RouteComponent() {
  const list = [{ label: 'Catatan Keuangan', to: '/catatan-keuangan', active: true }];

  const [tab, setTab] = useState('tabel');
  const data = Route.useLoaderData();

  console.log('Data catatan keuangan:', data);

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
