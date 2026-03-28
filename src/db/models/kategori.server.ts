import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const kategoriSchema = new Schema(
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
  },
  {
    timestamps: true,
  },
);

kategoriSchema.index({ userId: 1, nama: 1 }, { unique: true });

export type KategoriDoc = InferSchemaType<typeof kategoriSchema>;
export const Kategori = mongoose.models.Kategori || mongoose.model<KategoriDoc>('Kategori', kategoriSchema, 'kategori');
