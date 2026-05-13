import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const balanceSettingsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    openingCash: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    openingNonCash: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    activatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export type BalanceSettingsDoc = InferSchemaType<typeof balanceSettingsSchema>;
export const BalanceSettings =
  mongoose.models.BalanceSettings ||
  mongoose.model<BalanceSettingsDoc>(
    'BalanceSettings',
    balanceSettingsSchema,
    'balance_settings',
  );
