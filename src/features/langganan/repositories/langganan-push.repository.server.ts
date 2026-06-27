import { Kantong } from '#/db/models/kantong.server';
import { LanggananPushDelivery } from '#/db/models/langganan-push-delivery.server';
import { Langganan } from '#/db/models/langganan.server';
import { connectDB } from '#/db/mongoose.server';
import type { LanggananReminderMilestone } from '#/types/langganan';

export type LanggananPushSource = {
  _id: unknown;
  userId: string;
  nama: string;
  nominal: number;
  frequency: 'bulanan' | 'tahunan';
  nextDueDate: string;
  reminderDays?: number;
  kantong: unknown;
  status: 'aktif' | 'dijeda';
  kantongName?: string;
};

export type LanggananPushDeliveryKey = {
  userId: string;
  langgananId: string;
  subscriptionId: string;
  milestone: LanggananReminderMilestone;
  dueDate: string;
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function stringifyId(value: unknown) {
  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value);
  }

  return String(value);
}

export async function findActiveLanggananPushSources(): Promise<
  LanggananPushSource[]
> {
  await connectDB();

  const items = await Langganan.find({ status: 'aktif' })
    .sort({ nextDueDate: 1, createdAt: 1 })
    .lean();
  const kantongIds = unique(items.map((item) => stringifyId(item.kantong)));
  const kantongs = await Kantong.find({ _id: { $in: kantongIds } })
    .select({ nama: 1 })
    .lean();
  const kantongMap = new Map(kantongs.map((item) => [stringifyId(item._id), item.nama]));

  return items.map((item) => ({
    ...item,
    kantongName: kantongMap.get(stringifyId(item.kantong)),
  }));
}

export async function claimLanggananPushDelivery(key: LanggananPushDeliveryKey) {
  await connectDB();

  try {
    return await LanggananPushDelivery.findOneAndUpdate(
      {
        userId: key.userId,
        langgananId: key.langgananId,
        subscriptionId: key.subscriptionId,
        milestone: key.milestone,
        dueDate: key.dueDate,
        status: { $ne: 'sent' },
      },
      {
        $setOnInsert: {
          userId: key.userId,
          langgananId: key.langgananId,
          subscriptionId: key.subscriptionId,
          milestone: key.milestone,
          dueDate: key.dueDate,
        },
        $set: {
          status: 'pending',
        },
        $unset: {
          sentAt: 1,
          errorMessage: 1,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
      },
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return null;
    }

    throw error;
  }
}

export async function markLanggananPushDeliverySent(id: string) {
  await connectDB();

  return LanggananPushDelivery.findByIdAndUpdate(id, {
    $set: {
      status: 'sent',
      sentAt: new Date(),
    },
    $unset: {
      errorMessage: 1,
    },
  });
}

export async function markLanggananPushDeliveryFailed(
  id: string,
  errorMessage: string,
) {
  await connectDB();

  return LanggananPushDelivery.findByIdAndUpdate(id, {
    $set: {
      status: 'failed',
      errorMessage,
    },
  });
}
