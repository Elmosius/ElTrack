import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const langgananSchema = new Schema(
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
    nominal: {
      type: Number,
      required: true,
      min: 1,
    },
    frequency: {
      type: String,
      enum: ['bulanan', 'tahunan'],
      required: true,
    },
    nextDueDate: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    reminderDays: {
      type: Number,
      required: true,
      min: 0,
      default: 3,
    },
    kantong: {
      type: Schema.Types.ObjectId,
      ref: 'Kantong',
      required: true,
    },
    status: {
      type: String,
      enum: ['aktif', 'dijeda'],
      required: true,
      default: 'aktif',
    },
    catatan: {
      type: String,
      trim: true,
    },
    lastPaidAt: {
      type: String,
      trim: true,
    },
    lastTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaksi',
    },
  },
  {
    timestamps: true,
  },
);

langgananSchema.index({ userId: 1, status: 1, nextDueDate: 1 });

export type LanggananDoc = InferSchemaType<typeof langgananSchema>;
export const Langganan =
  mongoose.models.Langganan ||
  mongoose.model<LanggananDoc>('Langganan', langgananSchema, 'langganan');
