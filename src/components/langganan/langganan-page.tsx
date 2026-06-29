import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import {
  Dialog,
  DialogPopup,
  DialogTrigger,
} from '#/components/selia/dialog';
import type { LanggananPageData, LanggananViewItem } from '#/types/langganan';
import { Link } from '@tanstack/react-router';
import { BellRing, Plus, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { LanggananCard } from './langganan-card';
import { LanggananForm } from './langganan-form';
import { LanggananPushNotificationCard } from './langganan-push-notification-card';
import { LanggananReminderSection } from './langganan-reminder-section';
import { LanggananSummaryCards } from './langganan-summary-cards';

type LanggananPageProps = {
  data: LanggananPageData;
};

export function LanggananPage({ data }: LanggananPageProps) {
  const [editingItem, setEditingItem] = useState<LanggananViewItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const hasKantongs = data.kantongs.length > 0;
  const hasItems = data.items.length > 0;

  if (!data.isKantongConfigured || !hasKantongs) {
    return (
      <Card>
        <CardBody className='flex flex-col items-start gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <WalletCards className='size-5 text-primary' />
              <h2 className='text-base font-semibold'>Buat Kantong dulu</h2>
            </div>
            <p className='max-w-2xl text-sm text-muted'>
              Langganan perlu Kantong pembayaran supaya saat bayar, transaksi
              bisa langsung mengurangi saldo yang tepat.
            </p>
          </div>
          <Link to='/kantong'>
            <Button className='text-sm'>
              <Plus className='size-4' />
              Buka Kantong
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <LanggananSummaryCards summary={data.summary} />

      <LanggananPushNotificationCard initialState={data.push} />

      <LanggananReminderSection reminders={data.reminders} />

      <div className='md:hidden'>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger render={<Button className='w-full text-sm' />}>
            <Plus className='size-4' />
            Tambah Langganan
          </DialogTrigger>
          <DialogPopup className='!bottom-0 !left-0 !right-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-b-none !rounded-t-2xl'>
            <LanggananForm
              key={isCreateDialogOpen ? 'create-langganan-open' : 'create-langganan-closed'}
              kantongs={data.kantongs}
              onSuccess={() => setIsCreateDialogOpen(false)}
              variant='dialog'
            />
          </DialogPopup>
        </Dialog>
      </div>

      <div className='hidden md:block'>
        <LanggananForm kantongs={data.kantongs} />
      </div>

      {editingItem && (
        <>
          <div className='md:hidden'>
            <Dialog
              open={Boolean(editingItem)}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingItem(null);
                }
              }}
            >
              <DialogPopup className='!bottom-0 !left-0 !right-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-b-none !rounded-t-2xl'>
                <LanggananForm
                  key={editingItem._id}
                  initialItem={editingItem}
                  kantongs={data.kantongs}
                  onCancel={() => setEditingItem(null)}
                  variant='dialog'
                />
              </DialogPopup>
            </Dialog>
          </div>

          <div className='hidden md:block'>
            <LanggananForm
              key={editingItem._id}
              initialItem={editingItem}
              kantongs={data.kantongs}
              onCancel={() => setEditingItem(null)}
            />
          </div>
        </>
      )}

      {hasItems ? (
        <div className='grid gap-4 xl:grid-cols-2'>
          {data.items.map((item) => (
            <LanggananCard
              key={item._id}
              item={item}
              onEdit={setEditingItem}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className='flex flex-col items-center gap-3 p-6 text-center md:p-8'>
            <BellRing className='size-8 text-primary' />
            <div className='space-y-1'>
              <h2 className='text-base font-semibold'>Belum ada langganan</h2>
              <p className='max-w-md text-sm text-muted'>
                Tambahkan layanan rutin pertama supaya tagihan berikutnya tidak
                gampang kelewat.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
