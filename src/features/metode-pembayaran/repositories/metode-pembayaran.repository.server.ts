import { MetodePembayaran } from '#/db/models/metode-pembayaran.server';
import { connectDB } from '#/db/mongoose.server';

export async function findMetodePembayaranList() {
  await connectDB();

  return MetodePembayaran.find().sort({ createdAt: 1 }).lean();
}
