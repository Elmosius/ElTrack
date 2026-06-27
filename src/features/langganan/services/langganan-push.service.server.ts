import '@tanstack/react-start/server-only';

import * as webPush from 'web-push';
import type { PushSubscription as WebPushSubscriptionPayload } from 'web-push';
import { serializeLanggananDoc } from '../mappers';
import type {
  DeletePushSubscriptionInput,
  PushSubscriptionInput,
} from '../langganan.schema';
import {
  countActivePushSubscriptionsByUserId,
  deactivatePushSubscription,
  deactivatePushSubscriptionById,
  findActivePushSubscriptionsByUserIds,
  upsertPushSubscription,
} from '../repositories/push-subscription.repository.server';
import {
  claimLanggananPushDelivery,
  findActiveLanggananPushSources,
  markLanggananPushDeliveryFailed,
  markLanggananPushDeliverySent,
  type LanggananPushSource,
} from '../repositories/langganan-push.repository.server';
import {
  calculateDaysUntilDue,
  getLanggananReminderMilestone,
} from './langganan-calculation.server';
import type {
  LanggananPushState,
  LanggananReminderMilestone,
} from '#/types/langganan';

type ActivePushSubscription = {
  _id: unknown;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type LanggananPushCandidate = {
  userId: string;
  langgananId: string;
  nama: string;
  nominal: number;
  nextDueDate: string;
  reminderDays: number;
  milestone: LanggananReminderMilestone;
  daysUntilDue: number;
  kantongName: string;
  subscription: ActivePushSubscription;
};

export type LanggananPushRunResult = {
  candidates: number;
  sent: number;
  skipped: number;
  failed: number;
  deactivated: number;
  failures: Array<{
    langgananId: string;
    subscriptionId: string;
    message: string;
  }>;
};

export type LanggananPushSender = (
  subscription: WebPushSubscriptionPayload,
  payload: string,
) => Promise<unknown>;

type VapidConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

function getPublicVapidKey() {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

function getVapidConfig(): VapidConfig {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();

  if (!publicKey) {
    throw new Error('VAPID_PUBLIC_KEY is required to send push reminders.');
  }

  if (!privateKey) {
    throw new Error('VAPID_PRIVATE_KEY is required to send push reminders.');
  }

  if (!subject) {
    throw new Error('VAPID_SUBJECT is required to send push reminders.');
  }

  return { publicKey, privateKey, subject };
}

function createWebPushSender(config: VapidConfig): LanggananPushSender {
  webPush.setVapidDetails(config.subject, config.publicKey, config.privateKey);

  return (subscription, payload) =>
    webPush.sendNotification(subscription, payload, {
      TTL: 60 * 60 * 24,
      urgency: 'normal',
    });
}

function stringifyId(value: unknown) {
  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value);
  }

  return String(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function getMilestoneLabel(candidate: Pick<LanggananPushCandidate, 'milestone' | 'daysUntilDue' | 'reminderDays'>) {
  if (candidate.milestone === 'overdue') {
    return `lewat ${Math.abs(candidate.daysUntilDue)} hari`;
  }

  if (candidate.milestone === 'due') {
    return 'jatuh tempo hari ini';
  }

  if (candidate.milestone === 'h-1') {
    return 'jatuh tempo besok';
  }

  return `jatuh tempo dalam ${candidate.reminderDays} hari`;
}

function buildPushPayload(candidate: LanggananPushCandidate) {
  const label = getMilestoneLabel(candidate);

  return JSON.stringify({
    title: `Tagihan ${candidate.nama} ${label}`,
    body: `${formatCurrency(candidate.nominal)} • ${formatDate(candidate.nextDueDate)} • ${candidate.kantongName}`,
    url: '/langganan',
    tag: `langganan-${candidate.langgananId}-${candidate.nextDueDate}`,
    data: {
      langgananId: candidate.langgananId,
      dueDate: candidate.nextDueDate,
      milestone: candidate.milestone,
    },
  });
}

function toWebPushSubscription(
  subscription: ActivePushSubscription,
): WebPushSubscriptionPayload {
  return {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  };
}

function isExpiredPushSubscriptionError(error: unknown) {
  if (!error || typeof error !== 'object' || !('statusCode' in error)) {
    return false;
  }

  const statusCode = Number(error.statusCode);
  return statusCode === 404 || statusCode === 410;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export async function getLanggananPushStateService(
  userId: string,
): Promise<LanggananPushState> {
  const [activeSubscriptionCount, vapidPublicKey] = await Promise.all([
    countActivePushSubscriptionsByUserId(userId),
    Promise.resolve(getPublicVapidKey()),
  ]);

  return {
    status: activeSubscriptionCount > 0 ? 'active' : 'inactive',
    activeSubscriptionCount,
    vapidPublicKey,
  };
}

export async function saveLanggananPushSubscriptionService(
  userId: string,
  data: PushSubscriptionInput,
) {
  const subscription = await upsertPushSubscription(userId, data);

  return {
    id: stringifyId(subscription?._id),
    active: true,
  };
}

export async function deleteLanggananPushSubscriptionService(
  userId: string,
  data: DeletePushSubscriptionInput,
) {
  await deactivatePushSubscription(userId, data);

  return {
    endpoint: data.endpoint,
    active: false,
  };
}

export function buildLanggananPushCandidates({
  sources,
  subscriptions,
  now,
}: {
  sources: LanggananPushSource[];
  subscriptions: ActivePushSubscription[];
  now?: Date;
}): LanggananPushCandidate[] {
  const subscriptionMap = new Map<string, ActivePushSubscription[]>();

  for (const subscription of subscriptions) {
    const current = subscriptionMap.get(subscription.userId) ?? [];
    current.push(subscription);
    subscriptionMap.set(subscription.userId, current);
  }

  return sources.flatMap((source) => {
    const item = serializeLanggananDoc(source);
    const milestone = getLanggananReminderMilestone({
      status: item.status,
      nextDueDate: item.nextDueDate,
      reminderDays: item.reminderDays,
      now,
    });

    if (!milestone) {
      return [];
    }

    const activeSubscriptions = subscriptionMap.get(item.userId) ?? [];

    return activeSubscriptions.map((subscription) => ({
      userId: item.userId,
      langgananId: item._id,
      nama: item.nama,
      nominal: item.nominal,
      nextDueDate: item.nextDueDate,
      reminderDays: item.reminderDays,
      milestone,
      daysUntilDue: calculateDaysUntilDue({
        nextDueDate: item.nextDueDate,
        now,
      }),
      kantongName: source.kantongName ?? 'Kantong',
      subscription,
    }));
  });
}

export async function runLanggananPushReminderJob({
  now = new Date(),
  sender,
  config,
}: {
  now?: Date;
  sender?: LanggananPushSender;
  config?: VapidConfig;
} = {}): Promise<LanggananPushRunResult> {
  const runtimeConfig = config ?? getVapidConfig();
  const pushSender = sender ?? createWebPushSender(runtimeConfig);
  const sources = await findActiveLanggananPushSources();
  const subscriptions = await findActivePushSubscriptionsByUserIds(
    sources.map((source) => source.userId),
  );
  const candidates = buildLanggananPushCandidates({
    sources,
    subscriptions,
    now,
  });
  const result: LanggananPushRunResult = {
    candidates: candidates.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    deactivated: 0,
    failures: [],
  };

  for (const candidate of candidates) {
    const subscriptionId = stringifyId(candidate.subscription._id);
    const delivery = await claimLanggananPushDelivery({
      userId: candidate.userId,
      langgananId: candidate.langgananId,
      subscriptionId,
      milestone: candidate.milestone,
      dueDate: candidate.nextDueDate,
    });

    if (!delivery) {
      result.skipped += 1;
      continue;
    }

    try {
      await pushSender(
        toWebPushSubscription(candidate.subscription),
        buildPushPayload(candidate),
      );
      await markLanggananPushDeliverySent(stringifyId(delivery._id));
      result.sent += 1;
    } catch (error) {
      const message = getErrorMessage(error);

      if (isExpiredPushSubscriptionError(error)) {
        await deactivatePushSubscriptionById(subscriptionId);
        result.deactivated += 1;
      }

      await markLanggananPushDeliveryFailed(stringifyId(delivery._id), message);
      result.failed += 1;
      result.failures.push({
        langgananId: candidate.langgananId,
        subscriptionId,
        message,
      });
    }
  }

  return result;
}
