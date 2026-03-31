import { Types } from 'mongoose';
import type { UIMessage } from '@tanstack/ai-react';
import { ChatMessage } from '#/db/models/chat-message.server';
import { connectDB } from '#/db/mongoose.server';

export async function findChatMessagesBySessionId(
  userId: string,
  chatSessionId: string,
) {
  await connectDB();

  return ChatMessage.find({
    userId,
    sessionId: new Types.ObjectId(chatSessionId),
  })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
}

export async function upsertChatMessageBySessionId(
  userId: string,
  chatSessionId: string,
  message: UIMessage,
) {
  await connectDB();

  return ChatMessage.findOneAndUpdate(
    {
      sessionId: new Types.ObjectId(chatSessionId),
      messageId: message.id,
    },
    {
      $setOnInsert: {
        sessionId: new Types.ObjectId(chatSessionId),
        userId,
        messageId: message.id,
        role: message.role,
        parts: message.parts,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
    },
  );
}
