import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const pushSubscriptionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
        trim: true,
      },
      auth: {
        type: String,
        required: true,
        trim: true,
      },
    },
    userAgent: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

pushSubscriptionSchema.index({ userId: 1, isActive: 1 });

export type PushSubscriptionDoc = InferSchemaType<typeof pushSubscriptionSchema>;

export const PushSubscriptionModel =
  mongoose.models.PushSubscription ||
  mongoose.model<PushSubscriptionDoc>(
    'PushSubscription',
    pushSubscriptionSchema,
    'push_subscriptions',
  );
