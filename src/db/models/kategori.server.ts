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
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export type KategoriDoc = InferSchemaType<typeof kategoriSchema>;
export const Kategori = mongoose.models.Kategori || mongoose.model<KategoriDoc>('Kategori', kategoriSchema, 'kategori');
