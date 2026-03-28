import { Tipe } from '#/db/models/tipe.server';
import { connectDB } from '#/db/mongoose.server';

export async function listTipe() {
  await connectDB();

  const list = await Tipe.find().sort({ createdAt: 1 }).lean();

  return list.map((item) => ({
    ...item,
    _id: String(item._id),
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
  }));
}
