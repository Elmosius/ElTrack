import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LanggananPushSource } from '../repositories/langganan-push.repository.server';

const mocks = vi.hoisted(() => ({
  claimLanggananPushDelivery: vi.fn(),
  countActivePushSubscriptionsByUserId: vi.fn(),
  deactivatePushSubscription: vi.fn(),
  deactivatePushSubscriptionById: vi.fn(),
  findActiveLanggananPushSources: vi.fn(),
  findActivePushSubscriptionsByUserIds: vi.fn(),
  markLanggananPushDeliveryFailed: vi.fn(),
  markLanggananPushDeliverySent: vi.fn(),
  upsertPushSubscription: vi.fn(),
}));

vi.mock('../repositories/langganan-push.repository.server', () => ({
  claimLanggananPushDelivery: mocks.claimLanggananPushDelivery,
  findActiveLanggananPushSources: mocks.findActiveLanggananPushSources,
  markLanggananPushDeliveryFailed: mocks.markLanggananPushDeliveryFailed,
  markLanggananPushDeliverySent: mocks.markLanggananPushDeliverySent,
}));

vi.mock('../repositories/push-subscription.repository.server', () => ({
  countActivePushSubscriptionsByUserId: mocks.countActivePushSubscriptionsByUserId,
  deactivatePushSubscription: mocks.deactivatePushSubscription,
  deactivatePushSubscriptionById: mocks.deactivatePushSubscriptionById,
  findActivePushSubscriptionsByUserIds: mocks.findActivePushSubscriptionsByUserIds,
  upsertPushSubscription: mocks.upsertPushSubscription,
}));

import {
  buildLanggananPushCandidates,
  deleteLanggananPushSubscriptionService,
  getLanggananPushStateService,
  runLanggananPushReminderJob,
  saveLanggananPushSubscriptionService,
} from './langganan-push.service.server';

const now = new Date('2026-06-25T08:00:00.000Z');
const config = {
  publicKey: 'public-key',
  privateKey: 'private-key',
  subject: 'mailto:test@example.com',
};

const subscription = {
  _id: 'subscription-1',
  userId: 'user-1',
  endpoint: 'https://push.example.test/1',
  keys: {
    p256dh: 'p256dh-key',
    auth: 'auth-key',
  },
};

function createSource(overrides: Partial<LanggananPushSource> = {}): LanggananPushSource {
  return {
    _id: overrides._id ?? '507f1f77bcf86cd799439013',
    userId: overrides.userId ?? 'user-1',
    nama: overrides.nama ?? 'Netflix',
    nominal: overrides.nominal ?? 75_000,
    frequency: overrides.frequency ?? 'bulanan',
    nextDueDate: overrides.nextDueDate ?? '2026-06-28',
    reminderDays: overrides.reminderDays ?? 3,
    kantong: overrides.kantong ?? '507f1f77bcf86cd799439099',
    status: overrides.status ?? 'aktif',
    kantongName: overrides.kantongName ?? 'Tunai',
  };
}

describe('langganan push service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VAPID_PUBLIC_KEY;
  });

  it('builds candidates only for push milestone days and active subscriptions', () => {
    const candidates = buildLanggananPushCandidates({
      now,
      sources: [
        createSource({ _id: '507f1f77bcf86cd799439001', nextDueDate: '2026-06-28' }),
        createSource({ _id: '507f1f77bcf86cd799439002', nextDueDate: '2026-06-26' }),
        createSource({ _id: '507f1f77bcf86cd799439003', nextDueDate: '2026-06-25' }),
        createSource({ _id: '507f1f77bcf86cd799439004', nextDueDate: '2026-06-20' }),
        createSource({ _id: '507f1f77bcf86cd799439005', nextDueDate: '2026-06-27' }),
        createSource({
          _id: '507f1f77bcf86cd799439006',
          nextDueDate: '2026-06-28',
          status: 'dijeda',
        }),
      ],
      subscriptions: [subscription],
    });

    expect(candidates.map((item) => item.milestone)).toEqual([
      'h-n',
      'h-1',
      'due',
      'overdue',
    ]);
  });

  it('returns push state using active subscription count and VAPID public key', async () => {
    process.env.VAPID_PUBLIC_KEY = 'public-key';
    mocks.countActivePushSubscriptionsByUserId.mockResolvedValue(1);

    await expect(getLanggananPushStateService('user-1')).resolves.toEqual({
      status: 'active',
      activeSubscriptionCount: 1,
      vapidPublicKey: 'public-key',
    });
  });

  it('saves and deactivates the active user subscription', async () => {
    mocks.upsertPushSubscription.mockResolvedValue({ _id: 'subscription-1' });
    mocks.deactivatePushSubscription.mockResolvedValue({ _id: 'subscription-1' });

    await saveLanggananPushSubscriptionService('user-1', {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: 'Test Browser',
    });
    await deleteLanggananPushSubscriptionService('user-1', {
      endpoint: subscription.endpoint,
    });

    expect(mocks.upsertPushSubscription).toHaveBeenCalledWith('user-1', {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: 'Test Browser',
    });
    expect(mocks.deactivatePushSubscription).toHaveBeenCalledWith('user-1', {
      endpoint: subscription.endpoint,
    });
  });

  it('sends claimed push reminders and marks deliveries as sent', async () => {
    const sender = vi.fn().mockResolvedValue({});
    mocks.findActiveLanggananPushSources.mockResolvedValue([createSource()]);
    mocks.findActivePushSubscriptionsByUserIds.mockResolvedValue([subscription]);
    mocks.claimLanggananPushDelivery.mockResolvedValue({ _id: 'delivery-1' });

    const result = await runLanggananPushReminderJob({
      now,
      sender,
      config,
    });

    expect(result).toEqual({
      candidates: 1,
      sent: 1,
      skipped: 0,
      failed: 0,
      deactivated: 0,
      failures: [],
    });
    expect(mocks.claimLanggananPushDelivery).toHaveBeenCalledWith({
      userId: 'user-1',
      langgananId: '507f1f77bcf86cd799439013',
      subscriptionId: 'subscription-1',
      milestone: 'h-n',
      dueDate: '2026-06-28',
    });
    expect(sender).toHaveBeenCalledWith(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      expect.stringContaining('Tagihan Netflix jatuh tempo dalam 3 hari'),
    );
    expect(mocks.markLanggananPushDeliverySent).toHaveBeenCalledWith('delivery-1');
  });

  it('skips push reminders that were already sent', async () => {
    const sender = vi.fn();
    mocks.findActiveLanggananPushSources.mockResolvedValue([createSource()]);
    mocks.findActivePushSubscriptionsByUserIds.mockResolvedValue([subscription]);
    mocks.claimLanggananPushDelivery.mockResolvedValue(null);

    const result = await runLanggananPushReminderJob({
      now,
      sender,
      config,
    });

    expect(result).toMatchObject({
      candidates: 1,
      sent: 0,
      skipped: 1,
      failed: 0,
    });
    expect(sender).not.toHaveBeenCalled();
  });

  it('marks failed deliveries and deactivates expired subscriptions', async () => {
    const error = Object.assign(new Error('Gone'), { statusCode: 410 });
    const sender = vi.fn().mockRejectedValue(error);
    mocks.findActiveLanggananPushSources.mockResolvedValue([createSource()]);
    mocks.findActivePushSubscriptionsByUserIds.mockResolvedValue([subscription]);
    mocks.claimLanggananPushDelivery.mockResolvedValue({ _id: 'delivery-1' });

    const result = await runLanggananPushReminderJob({
      now,
      sender,
      config,
    });

    expect(result).toMatchObject({
      candidates: 1,
      sent: 0,
      skipped: 0,
      failed: 1,
      deactivated: 1,
      failures: [
        {
          langgananId: '507f1f77bcf86cd799439013',
          subscriptionId: 'subscription-1',
          message: 'Gone',
        },
      ],
    });
    expect(mocks.deactivatePushSubscriptionById).toHaveBeenCalledWith('subscription-1');
    expect(mocks.markLanggananPushDeliveryFailed).toHaveBeenCalledWith(
      'delivery-1',
      'Gone',
    );
  });
});
