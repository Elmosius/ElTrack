import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const langgananPushDeliverySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    langgananId: {
      type: Schema.Types.ObjectId,
      ref: 'Langganan',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'PushSubscription',
      required: true,
      index: true,
    },
    milestone: {
      type: String,
      enum: ['h-n', 'h-1', 'due', 'overdue'],
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      required: true,
      default: 'pending',
      index: true,
    },
    sentAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

langgananPushDeliverySchema.index(
  {
    userId: 1,
    langgananId: 1,
    milestone: 1,
    dueDate: 1,
    subscriptionId: 1,
  },
  { unique: true },
);

export type LanggananPushDeliveryDoc = InferSchemaType<
  typeof langgananPushDeliverySchema
>;

export const LanggananPushDelivery =
  mongoose.models.LanggananPushDelivery ||
  mongoose.model<LanggananPushDeliveryDoc>(
    'LanggananPushDelivery',
    langgananPushDeliverySchema,
    'langganan_push_deliveries',
  );
