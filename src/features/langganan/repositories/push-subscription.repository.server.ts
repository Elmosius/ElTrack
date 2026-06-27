import { PushSubscriptionModel } from '#/db/models/push-subscription.server';
import { connectDB } from '#/db/mongoose.server';
import type {
  DeletePushSubscriptionInput,
  PushSubscriptionInput,
} from '../langganan.schema';

export async function upsertPushSubscription(
  userId: string,
  data: PushSubscriptionInput,
) {
  await connectDB();

  return PushSubscriptionModel.findOneAndUpdate(
    {
      endpoint: data.endpoint,
    },
    {
      $set: {
        userId,
        endpoint: data.endpoint,
        keys: data.keys,
        userAgent: data.userAgent || undefined,
        isActive: true,
        lastSeenAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
    },
  ).lean();
}

export async function deactivatePushSubscription(
  userId: string,
  data: DeletePushSubscriptionInput,
) {
  await connectDB();

  return PushSubscriptionModel.findOneAndUpdate(
    {
      userId,
      endpoint: data.endpoint,
    },
    {
      $set: {
        isActive: false,
        lastSeenAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  ).lean();
}

export async function deactivatePushSubscriptionById(id: string) {
  await connectDB();

  return PushSubscriptionModel.findByIdAndUpdate(id, {
    $set: {
      isActive: false,
      lastSeenAt: new Date(),
    },
  });
}

export async function countActivePushSubscriptionsByUserId(userId: string) {
  await connectDB();

  return PushSubscriptionModel.countDocuments({
    userId,
    isActive: true,
  });
}

export async function findActivePushSubscriptionsByUserIds(userIds: string[]) {
  await connectDB();

  if (userIds.length === 0) {
    return [];
  }

  return PushSubscriptionModel.find({
    userId: { $in: [...new Set(userIds)] },
    isActive: true,
  }).lean();
}
