import { requireSessionUserId } from '#/lib/server-auth';
import { createServerFn } from '@tanstack/react-start';
import { dashboardMonthInputSchema } from './dashboard.schema';
import { getDashboardHomeData } from './dashboard.server';

export const getDashboardHome = createServerFn({ method: 'POST' })
  .inputValidator(dashboardMonthInputSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return getDashboardHomeData(userId, data);
  });
