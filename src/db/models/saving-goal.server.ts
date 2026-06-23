import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const savingGoalSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    media: {
      type: String,
      required: true,
      trim: true,
    },
    kantong: {
      type: Schema.Types.ObjectId,
      ref: 'Kantong',
      required: true,
      index: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    deadline: {
      type: String,
      trim: true,
    },
    monthlyContributionTarget: {
      type: Number,
      min: 0,
    },
    catatan: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

savingGoalSchema.index({ userId: 1, createdAt: 1 });

export type SavingGoalDoc = InferSchemaType<typeof savingGoalSchema>;
export const SavingGoal =
  mongoose.models.SavingGoal ||
  mongoose.model<SavingGoalDoc>('SavingGoal', savingGoalSchema, 'saving_goals');
