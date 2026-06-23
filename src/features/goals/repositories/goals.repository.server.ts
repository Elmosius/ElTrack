import { SavingGoal } from '#/db/models/saving-goal.server';
import { connectDB } from '#/db/mongoose.server';
import type {
  CreateSavingGoalInput,
  DeleteSavingGoalInput,
  UpdateSavingGoalInput,
} from '../goals.schema';

function normalizeGoalPayload(data: CreateSavingGoalInput) {
  return {
    nama: data.nama,
    media: data.media,
    kantong: data.kantong,
    targetAmount: data.targetAmount,
    deadline: data.deadline || undefined,
    monthlyContributionTarget: data.monthlyContributionTarget,
    catatan: data.catatan || undefined,
  };
}

function buildGoalUpdate(data: UpdateSavingGoalInput) {
  const setFields: Record<string, unknown> = {
    nama: data.nama,
    media: data.media,
    kantong: data.kantong,
    targetAmount: data.targetAmount,
  };
  const unsetFields: Record<string, 1> = {};

  if (data.deadline) {
    setFields.deadline = data.deadline;
  } else {
    unsetFields.deadline = 1;
  }

  if (data.monthlyContributionTarget != null) {
    setFields.monthlyContributionTarget = data.monthlyContributionTarget;
  } else {
    unsetFields.monthlyContributionTarget = 1;
  }

  if (data.catatan) {
    setFields.catatan = data.catatan;
  } else {
    unsetFields.catatan = 1;
  }

  return Object.keys(unsetFields).length > 0
    ? {
        $set: setFields,
        $unset: unsetFields,
      }
    : {
        $set: setFields,
      };
}

export async function findSavingGoalListByUserId(userId: string) {
  await connectDB();

  return SavingGoal.find({ userId }).sort({ createdAt: 1 }).lean();
}

export async function insertSavingGoal(
  userId: string,
  data: CreateSavingGoalInput,
) {
  await connectDB();

  return SavingGoal.create({
    ...normalizeGoalPayload(data),
    userId,
  });
}

export async function updateSavingGoalById(
  userId: string,
  data: UpdateSavingGoalInput,
) {
  await connectDB();

  return SavingGoal.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    buildGoalUpdate(data),
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function deleteSavingGoalByIdAndUserId(
  userId: string,
  data: DeleteSavingGoalInput,
) {
  await connectDB();

  return SavingGoal.findOneAndDelete({
    _id: data.id,
    userId,
  });
}
