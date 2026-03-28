import { MetodePembayaran } from '#/db/models/metode-pembayaran.server';
import { connectDB } from '#/db/mongoose.server';

export async function listMetodePembayaran() {
  await connectDB();

  const list = await MetodePembayaran.find().sort({ createdAt: 1 }).lean();

  return list.map((item) => ({
    ...item,
    _id: String(item._id),
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
  }));
}
