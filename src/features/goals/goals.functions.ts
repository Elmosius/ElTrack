import { requireSessionUserId } from '#/lib/auth/session';
import { createServerFn } from '@tanstack/react-start';
import {
  createSavingGoalSchema,
  deleteSavingGoalSchema,
  updateSavingGoalSchema,
} from './goals.schema';
import {
  createSavingGoal,
  deleteSavingGoal,
  getGoalsPageData,
  updateSavingGoal,
} from './goals.server';

export const getGoalsData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return getGoalsPageData(userId);
  },
);

export const postSavingGoal = createServerFn({ method: 'POST' })
  .inputValidator(createSavingGoalSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return createSavingGoal(userId, data);
  });

export const patchSavingGoal = createServerFn({ method: 'POST' })
  .inputValidator(updateSavingGoalSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return updateSavingGoal(userId, data);
  });

export const deleteSavingGoalById = createServerFn({ method: 'POST' })
  .inputValidator(deleteSavingGoalSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return deleteSavingGoal(userId, data);
  });
