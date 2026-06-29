import { Button } from '#/components/selia/button';
import {
  Dialog,
  DialogPopup,
  DialogTrigger,
} from '#/components/selia/dialog';
import type { KantongPageData } from '#/types/kantong';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { KantongCreateCard } from './kantong-create-card';
import { KantongList } from './kantong-list';
import { KantongSetupCard } from './kantong-setup-card';
import { KantongSummaryCards } from './kantong-summary-cards';
import { KantongTransferDialog } from './kantong-transfer-dialog';

type KantongPageProps = {
  data: KantongPageData;
};

export function KantongPage({ data }: KantongPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (!data.isConfigured) {
    return <KantongSetupCard />;
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid gap-2 sm:flex sm:justify-start'>
        <KantongTransferDialog items={data.activeItems} />
        <div className='md:hidden'>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger render={<Button className='w-full text-sm' />}>
              <Plus className='size-4' />
              Tambah Kantong
            </DialogTrigger>
            <DialogPopup className='!bottom-0 !left-0 !right-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-b-none !rounded-t-2xl'>
              <KantongCreateCard
                key={isCreateDialogOpen ? 'create-kantong-open' : 'create-kantong-closed'}
                onSuccess={() => setIsCreateDialogOpen(false)}
                variant='dialog'
              />
            </DialogPopup>
          </Dialog>
        </div>
      </div>
      <KantongSummaryCards data={data} />
      <div className='hidden md:block'>
        <KantongCreateCard />
      </div>
      <KantongList items={data.activeItems} title='Kantong Aktif' />
      <KantongList items={data.archivedItems} title='Kantong Diarsipkan' />
    </div>
  );
}
