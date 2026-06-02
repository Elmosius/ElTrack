import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const kantongSchema = new Schema(
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
    normalizedName: {
      type: String,
      required: true,
      trim: true,
    },
    bucket: {
      type: String,
      enum: ['cash', 'non_cash'],
      required: true,
      default: 'non_cash',
    },
    openingBalance: {
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
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

kantongSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

export type KantongDoc = InferSchemaType<typeof kantongSchema>;
export const Kantong =
  mongoose.models.Kantong ||
  mongoose.model<KantongDoc>('Kantong', kantongSchema, 'kantong');
