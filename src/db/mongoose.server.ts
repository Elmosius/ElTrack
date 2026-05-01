import mongoose from 'mongoose';
import type { ClientSession } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

// supaya typescript ngerti bahwa kita menyimpan promise mongoose di globalThis, kita perlu mendeklarasikan tipe untuk globalThis.__mongoosePromise
declare global {
  var __mongoosePromise: Promise<typeof mongoose> | undefined;
}

// Fungsi untuk menghubungkan ke database MongoDB menggunakan Mongoose dan menyimpan promise koneksi di globalThis agar tidak membuat koneksi baru setiap kali fungsi dipanggil
export function connectDB() {
  if (!globalThis.__mongoosePromise) {
    globalThis.__mongoosePromise = mongoose.connect(MONGODB_URI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
  }

  return globalThis.__mongoosePromise;
}

function isTransactionUnsupportedError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('Transaction numbers are only allowed') ||
    error.message.includes('This MongoDB deployment does not support retryable writes')
  );
}

export async function runWithOptionalTransaction<T>(
  operation: (session?: ClientSession) => Promise<T>,
) {
  const connection = await connectDB();
  const session = await connection.startSession();

  try {
    let result: T | undefined;

    await session.withTransaction(async () => {
      result = await operation(session);
    });

    return result as T;
  } catch (error) {
    if (isTransactionUnsupportedError(error)) {
      return operation();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
