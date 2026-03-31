import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const chatMessageSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messageId: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['assistant', 'user', 'system'],
      required: true,
    },
    parts: {
      type: [Schema.Types.Mixed],
      required: true,
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ sessionId: 1, messageId: 1 }, { unique: true });

export type ChatMessageDoc = InferSchemaType<typeof chatMessageSchema>;
export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<ChatMessageDoc>('ChatMessage', chatMessageSchema, 'chat_messages');
