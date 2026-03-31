import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const chatSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Chat baru',
    },
    status: {
      type: String,
      enum: ['active'],
      default: 'active',
    },
    pendingPreview: {
      type: Schema.Types.Mixed,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

chatSessionSchema.index({ userId: 1, lastOpenedAt: -1, lastMessageAt: -1 });

export type ChatSessionDoc = InferSchemaType<typeof chatSessionSchema>;
export const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model<ChatSessionDoc>('ChatSession', chatSessionSchema, 'chat_sessions');
