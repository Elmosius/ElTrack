import { Waktu } from '#/db/models/waktu.server';
import { connectDB } from '#/db/mongoose.server';

export async function listWaktu() {
  await connectDB();

  return Waktu.find().sort({ createdAt: 1 }).lean();
}
