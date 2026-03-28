import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const transaksiSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    namaTransaksi: {
      type: String,
      required: true,
      trim: true,
    },
    waktu: {
      type: Schema.Types.ObjectId,
      ref: 'Waktu',
      required: true,
    },
    nominal: {
      type: Number,
      required: true,
      min: 0,
    },
    kategori: {
      type: Schema.Types.ObjectId,
      ref: 'Kategori',
      required: true,
    },
    metodePembayaran: {
      type: Schema.Types.ObjectId,
      ref: 'MetodePembayaran',
      required: true,
    },
    catatan: {
      type: String,
      trim: true,
    },
    tipe: {
      type: Schema.Types.ObjectId,
      ref: 'Tipe',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type TransaksiDoc = InferSchemaType<typeof transaksiSchema>;
export const Transaksi = mongoose.models.Transaksi || mongoose.model<TransaksiDoc>('Transaksi', transaksiSchema, 'transaksi');
