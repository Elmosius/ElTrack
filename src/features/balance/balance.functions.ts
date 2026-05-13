import { requireSessionUserId } from '#/lib/auth/session';
import { createServerFn } from '@tanstack/react-start';
import { upsertBalanceSettingsSchema } from './balance.schema';
import { getBalanceSummary, upsertBalanceSettings } from './balance.server';

export const getBalanceSummaryData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return getBalanceSummary(userId);
  },
);

export const saveBalanceSettings = createServerFn({ method: 'POST' })
  .inputValidator(upsertBalanceSettingsSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return upsertBalanceSettings(userId, data);
  });
