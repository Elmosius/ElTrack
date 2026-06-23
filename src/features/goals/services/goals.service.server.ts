import { findKantongByIdsAndUserId } from '#/features/kantong/repositories/kantong.repository.server';
import { getKantongPageDataService } from '#/features/kantong/services/kantong.service.server';
import type { GoalsPageData, SerializedSavingGoal } from '#/types/goals';
import type {
  CreateSavingGoalInput,
  DeleteSavingGoalInput,
  UpdateSavingGoalInput,
} from '../goals.schema';
import { serializeSavingGoalDoc } from '../mappers';
import {
  deleteSavingGoalByIdAndUserId,
  findSavingGoalListByUserId,
  insertSavingGoal,
  updateSavingGoalById,
} from '../repositories/goals.repository.server';
import { buildGoalSummary, buildGoalViewItems } from './goals-calculation.server';

const defaultMediaSuggestions = [
  'Reksadana',
  'Tabungan Bank',
  'Deposito',
  'Emas',
  'Saham',
  'Crypto',
];

async function ensureKantongBelongsToUser(userId: string, kantongId: string) {
  const [kantong] = await findKantongByIdsAndUserId(userId, [kantongId]);

  if (!kantong) {
    throw new Error('Kantong tidak ditemukan.');
  }
}

function buildMediaSuggestions(goals: SerializedSavingGoal[]) {
  return Array.from(
    new Set([
      ...defaultMediaSuggestions,
      ...goals.map((goal) => goal.media).filter(Boolean),
    ]),
  );
}

export async function getGoalsPageDataService(
  userId: string,
): Promise<GoalsPageData> {
  const [goals, kantongData] = await Promise.all([
    findSavingGoalListByUserId(userId),
    getKantongPageDataService(userId),
  ]);
  const serializedGoals = goals.map((item) => serializeSavingGoalDoc(item));
  const viewItems = buildGoalViewItems({
    goals: serializedGoals,
    kantongs: kantongData.items,
  });

  return {
    goals: viewItems,
    summary: buildGoalSummary(viewItems),
    kantongs: kantongData.activeItems,
    mediaSuggestions: buildMediaSuggestions(serializedGoals),
    isKantongConfigured: kantongData.isConfigured,
  };
}

export async function createSavingGoalService(
  userId: string,
  data: CreateSavingGoalInput,
): Promise<SerializedSavingGoal> {
  await ensureKantongBelongsToUser(userId, data.kantong);
  const goal = await insertSavingGoal(userId, data);
  return serializeSavingGoalDoc(goal.toObject());
}

export async function updateSavingGoalService(
  userId: string,
  data: UpdateSavingGoalInput,
): Promise<SerializedSavingGoal> {
  await ensureKantongBelongsToUser(userId, data.kantong);
  const goal = await updateSavingGoalById(userId, data);

  if (!goal) {
    throw new Error('Goal tidak ditemukan.');
  }

  return serializeSavingGoalDoc(goal.toObject());
}

export async function deleteSavingGoalService(
  userId: string,
  data: DeleteSavingGoalInput,
) {
  const goal = await deleteSavingGoalByIdAndUserId(userId, data);

  if (!goal) {
    throw new Error('Goal tidak ditemukan.');
  }

  return {
    id: data.id,
    deleted: true,
  };
}
