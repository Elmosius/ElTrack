import mongoose from 'mongoose';

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
