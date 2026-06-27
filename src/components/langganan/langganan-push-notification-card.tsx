import { Button } from '#/components/selia/button';
import { Card } from '#/components/selia/card';
import {
  deleteLanggananPushSubscriptionByEndpoint,
  postLanggananPushSubscription,
} from '#/features/langganan/langganan.functions';
import type { LanggananPushState, LanggananPushStatus } from '#/types/langganan';
import { useRouter } from '@tanstack/react-router';
import { BellRing, BellOff, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toastManager } from '../selia/toast';
import { getLanggananToastError } from './langganan-page.helpers';

type LanggananPushNotificationCardProps = {
  initialState: LanggananPushState;
};

type SerializedBrowserSubscription = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function isIosDevice() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') {
    return false;
  }

  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    standaloneNavigator.standalone === true
  );
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function getStatusCopy(status: LanggananPushStatus, activeSubscriptionCount: number) {
  if (status === 'active') {
    return activeSubscriptionCount > 1
      ? `Aktif di ${activeSubscriptionCount} perangkat`
      : 'Aktif di perangkat ini';
  }

  if (status === 'denied') {
    return 'Izin diblokir browser';
  }

  if (status === 'unsupported') {
    return 'Tidak didukung di mode ini';
  }

  return 'Belum aktif di perangkat ini';
}

function getStatusTone(status: LanggananPushStatus) {
  if (status === 'active') {
    return 'bg-success/10 text-success';
  }

  if (status === 'denied') {
    return 'bg-danger/10 text-danger';
  }

  if (status === 'unsupported') {
    return 'bg-warning/10 text-warning';
  }

  return 'bg-accent text-muted';
}

export function LanggananPushNotificationCard({
  initialState,
}: LanggananPushNotificationCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LanggananPushStatus>(initialState.status);
  const [activeSubscriptionCount, setActiveSubscriptionCount] = useState(
    initialState.activeSubscriptionCount,
  );
  const [localEndpoint, setLocalEndpoint] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const iosNeedsHomeScreen = useMemo(
    () => isIosDevice() && !isStandaloneDisplay(),
    [],
  );
  const description = getStatusCopy(status, activeSubscriptionCount);
  const detailMessages = [
    status === 'denied'
      ? 'Ubah izin notifikasi di pengaturan browser.'
      : null,
    iosNeedsHomeScreen
      ? 'Tambahkan ke Home Screen untuk notifikasi.'
      : null,
    !initialState.vapidPublicKey ? 'VAPID belum dikonfigurasi.' : null,
  ].filter(Boolean);

  useEffect(() => {
    let cancelled = false;

    async function syncBrowserState() {
      if (!initialState.vapidPublicKey || !isPushSupported()) {
        setStatus('unsupported');
        return;
      }

      if (Notification.permission === 'denied') {
        setStatus('denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (cancelled) {
        return;
      }

      setLocalEndpoint(subscription?.endpoint ?? null);
      setStatus(
        subscription || initialState.activeSubscriptionCount > 0
          ? 'active'
          : 'inactive',
      );
    }

    void syncBrowserState();

    return () => {
      cancelled = true;
    };
  }, [initialState.activeSubscriptionCount, initialState.vapidPublicKey]);

  const handleActivate = async () => {
    if (!initialState.vapidPublicKey || !isPushSupported()) {
      setStatus('unsupported');
      return;
    }

    try {
      setIsSaving(true);

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'inactive');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(initialState.vapidPublicKey),
        }));
      const serialized = subscription.toJSON() as SerializedBrowserSubscription;

      if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) {
        throw new Error('Data subscription push dari browser tidak lengkap.');
      }

      await postLanggananPushSubscription({
        data: {
          endpoint: serialized.endpoint,
          expirationTime: serialized.expirationTime ?? null,
          keys: {
            p256dh: serialized.keys.p256dh,
            auth: serialized.keys.auth,
          },
          userAgent: navigator.userAgent,
        },
      });

      setLocalEndpoint(serialized.endpoint);
      setStatus('active');
      setActiveSubscriptionCount((value) => Math.max(value, 1));
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: 'Notifikasi aktif',
        description: 'Reminder Langganan akan dikirim ke perangkat ini.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal mengaktifkan notifikasi',
        description: getLanggananToastError(
          error,
          'Terjadi kesalahan saat mengaktifkan push notification.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!localEndpoint) {
      setStatus('inactive');
      setActiveSubscriptionCount(0);
      return;
    }

    try {
      setIsSaving(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      await deleteLanggananPushSubscriptionByEndpoint({
        data: {
          endpoint: localEndpoint,
        },
      });
      await subscription?.unsubscribe();

      setLocalEndpoint(null);
      setStatus('inactive');
      setActiveSubscriptionCount((value) => Math.max(value - 1, 0));
      await router.invalidate();
      toastManager.add({
        type: 'success',
        title: 'Notifikasi nonaktif',
        description: 'Perangkat ini tidak akan menerima push reminder Langganan.',
      });
    } catch (error) {
      toastManager.add({
        type: 'error',
        title: 'Gagal menonaktifkan notifikasi',
        description: getLanggananToastError(
          error,
          'Terjadi kesalahan saat menonaktifkan push notification.',
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canActivate = status === 'inactive' || (status === 'active' && !localEndpoint);
  const canDeactivate = status === 'active' && Boolean(localEndpoint);

  return (
    <Card className='overflow-hidden'>
      <div className='flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex min-w-0 items-start gap-3 md:items-center'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary'>
            <Smartphone className='size-4' />
          </div>
          <div className='min-w-0 space-y-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm font-medium'>Notifikasi</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusTone(status)}`}
              >
                {description}
              </span>
            </div>
            {detailMessages.length > 0 ? (
              <p className='text-xs leading-relaxed text-muted'>
                {detailMessages.join(' ')}
              </p>
            ) : null}
          </div>
        </div>
        <div className='flex shrink-0'>
          {canDeactivate ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='text-sm'
              progress={isSaving}
              disabled={isSaving}
              onClick={handleDeactivate}
            >
              <BellOff className='size-4' />
              Nonaktifkan
            </Button>
          ) : (
            <Button
              type='button'
              size='sm'
              className='text-sm ring-0'
              progress={isSaving}
              disabled={!canActivate || isSaving}
              onClick={handleActivate}
            >
              <BellRing className='size-4' />
              Aktifkan
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
