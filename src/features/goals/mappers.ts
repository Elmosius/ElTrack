import { serializeDate, stringifyId } from '#/lib/serialization';
import type { SerializedSavingGoal } from '#/types/goals';

export function serializeSavingGoalDoc(item: {
  _id: unknown;
  userId: string;
  nama: string;
  media: string;
  kantong: unknown;
  targetAmount: number;
  deadline?: string;
  monthlyContributionTarget?: number;
  catatan?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SerializedSavingGoal {
  return {
    _id: stringifyId(item._id),
    userId: item.userId,
    nama: item.nama,
    media: item.media,
    kantong: stringifyId(item.kantong),
    targetAmount: item.targetAmount,
    deadline: item.deadline || undefined,
    monthlyContributionTarget: item.monthlyContributionTarget ?? undefined,
    catatan: item.catatan || undefined,
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
  };
}
