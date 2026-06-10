import type { KantongPageData } from '#/types/kantong';
import { KantongCreateCard } from './kantong-create-card';
import { KantongList } from './kantong-list';
import { KantongSetupCard } from './kantong-setup-card';
import { KantongSummaryCards } from './kantong-summary-cards';
import { KantongTransferDialog } from './kantong-transfer-dialog';

type KantongPageProps = {
  data: KantongPageData;
};

export function KantongPage({ data }: KantongPageProps) {
  if (!data.isConfigured) {
    return <KantongSetupCard />;
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-start'>
        <KantongTransferDialog items={data.activeItems} />
      </div>
      <KantongSummaryCards data={data} />
      <KantongCreateCard />
      <KantongList items={data.activeItems} title='Kantong Aktif' />
      <KantongList items={data.archivedItems} title='Kantong Diarsipkan' />
    </div>
  );
}
