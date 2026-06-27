import { requireSessionUserId } from '#/lib/auth/session';
import { createServerFn } from '@tanstack/react-start';
import {
  createLanggananSchema,
  deleteLanggananSchema,
  deletePushSubscriptionSchema,
  payLanggananSchema,
  pushSubscriptionSchema,
  setLanggananStatusSchema,
  updateLanggananSchema,
} from './langganan.schema';
import {
  createLangganan,
  deleteLangganan,
  deleteLanggananPushSubscription,
  getLanggananPageData,
  getLanggananPushState,
  payLangganan,
  saveLanggananPushSubscription,
  setLanggananStatus,
  updateLangganan,
} from './langganan.server';

export const getLanggananData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return getLanggananPageData(userId);
  },
);

export const postLangganan = createServerFn({ method: 'POST' })
  .inputValidator(createLanggananSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return createLangganan(userId, data);
  });

export const patchLangganan = createServerFn({ method: 'POST' })
  .inputValidator(updateLanggananSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return updateLangganan(userId, data);
  });

export const patchLanggananStatus = createServerFn({ method: 'POST' })
  .inputValidator(setLanggananStatusSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return setLanggananStatus(userId, data);
  });

export const postLanggananPayment = createServerFn({ method: 'POST' })
  .inputValidator(payLanggananSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return payLangganan(userId, data);
  });

export const deleteLanggananById = createServerFn({ method: 'POST' })
  .inputValidator(deleteLanggananSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return deleteLangganan(userId, data);
  });

export const getLanggananPushNotificationState = createServerFn({
  method: 'GET',
}).handler(async () => {
  const userId = await requireSessionUserId();
  return getLanggananPushState(userId);
});

export const postLanggananPushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(pushSubscriptionSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return saveLanggananPushSubscription(userId, data);
  });

export const deleteLanggananPushSubscriptionByEndpoint = createServerFn({
  method: 'POST',
})
  .inputValidator(deletePushSubscriptionSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return deleteLanggananPushSubscription(userId, data);
  });
