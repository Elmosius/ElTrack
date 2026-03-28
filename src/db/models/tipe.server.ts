import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const tipeSchema = new Schema(
  {
    nama: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export type TipeDoc = InferSchemaType<typeof tipeSchema>;
export const Tipe = mongoose.models.Tipe || mongoose.model<TipeDoc>('Tipe', tipeSchema);
