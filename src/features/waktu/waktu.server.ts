import { Waktu } from '#/db/models/waktu.server';
import { connectDB } from '#/db/mongoose.server';

export async function listWaktu() {
  await connectDB();

  const list = await Waktu.find().sort({ createdAt: 1 }).lean();

  return list.map((item) => ({
    ...item,
    _id: String(item._id),
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
  }));
}
