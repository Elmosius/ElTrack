import { Types } from 'mongoose';
import { ChatSession } from '#/db/models/chat-session.server';
import { connectDB } from '#/db/mongoose.server';

export async function findChatSessionByIdAndUserId(
  userId: string,
  chatSessionId: string,
) {
  await connectDB();

  if (!Types.ObjectId.isValid(chatSessionId)) {
    return null;
  }

  return ChatSession.findOne({
    _id: chatSessionId,
    userId,
  });
}

export async function findChatSessionListByUserId(userId: string) {
  await connectDB();

  return ChatSession.find({
    userId,
    status: 'active',
  })
    .sort({ lastOpenedAt: -1, lastMessageAt: -1, updatedAt: -1, _id: -1 })
    .lean();
}

export async function insertChatSession(userId: string, title: string) {
  await connectDB();

  return ChatSession.create({
    userId,
    title,
    status: 'active',
    lastOpenedAt: new Date(),
    lastMessageAt: null,
    pendingPreview: null,
  });
}

export async function touchChatSessionByIdAndUserId(
  userId: string,
  chatSessionId: string,
) {
  await connectDB();

  return ChatSession.findOneAndUpdate(
    {
      _id: chatSessionId,
      userId,
    },
    {
      $set: {
        lastOpenedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  );
}

export async function updateChatSessionPendingPreviewByIdAndUserId(
  userId: string,
  chatSessionId: string,
  preview: unknown,
) {
  await connectDB();

  return ChatSession.findOneAndUpdate(
    {
      _id: chatSessionId,
      userId,
    },
    {
      $set: {
        pendingPreview: preview,
        lastOpenedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
    },
  );
}

export async function updateChatSessionActivityByIdAndUserId(
  userId: string,
  chatSessionId: string,
) {
  const now = new Date();
  await connectDB();

  return ChatSession.findOneAndUpdate(
    {
      _id: chatSessionId,
      userId,
    },
    {
      $set: {
        lastMessageAt: now,
        lastOpenedAt: now,
      },
    },
    {
      returnDocument: 'after',
    },
  );
}

export async function updateChatSessionTitleIfDefault(
  userId: string,
  chatSessionId: string,
  title: string,
) {
  const now = new Date();
  await connectDB();

  return ChatSession.findOneAndUpdate(
    {
      _id: chatSessionId,
      userId,
      title: 'Chat baru',
      status: 'active',
    },
    {
      $set: {
        title,
        lastMessageAt: now,
        lastOpenedAt: now,
      },
    },
    {
      returnDocument: 'after',
    },
  );
}
