import { Tipe } from '#/db/models/tipe.server';
import { connectDB } from '#/db/mongoose.server';

export async function listTipe() {
  await connectDB();

  return Tipe.find().sort({ createdAt: 1 }).lean();
}
