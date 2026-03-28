import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const transaksiSchema = new Schema({
  namaTransaksi: {
    type: String,
    required: true,
  },
  waktu: {
    type: Schema.Types.ObjectId,
    ref: 'Waktu',
    required: true,
  },
  nominal: {
    type: Number,
    required: true,
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
  },
  tipe: {
    type: Schema.Types.ObjectId,
    ref: 'Tipe',
    required: true,
  },
});

export type TransaksiDoc = InferSchemaType<typeof transaksiSchema>;
export const Transaksi = mongoose.models.Transaksi || mongoose.model<TransaksiDoc>('Transaksi', transaksiSchema, 'transaksi');
