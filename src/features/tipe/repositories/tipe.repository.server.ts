import { Tipe } from '#/db/models/tipe.server';
import { connectDB } from '#/db/mongoose.server';

export async function findTipeList() {
  await connectDB();

  return Tipe.find().sort({ createdAt: 1 }).lean();
}

export async function findTipeByIds(ids: string[]) {
  await connectDB();

  return Tipe.find({
    _id: { $in: ids },
  })
    .select('_id')
    .lean();
}
