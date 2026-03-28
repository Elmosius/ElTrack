import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const waktuSchema = new Schema(
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

export type WaktuDoc = InferSchemaType<typeof waktuSchema>;
export const Waktu = mongoose.models.Waktu || mongoose.model<WaktuDoc>('Waktu', waktuSchema, 'waktu');
