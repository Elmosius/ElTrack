import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const metodePembayaranSchema = new Schema(
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

export type MetodePembayaranDoc = InferSchemaType<typeof metodePembayaranSchema>;
export const MetodePembayaran = mongoose.models.MetodePembayaran || mongoose.model<MetodePembayaranDoc>('MetodePembayaran', metodePembayaranSchema);
