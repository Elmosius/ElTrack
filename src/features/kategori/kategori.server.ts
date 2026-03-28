import { Kategori } from '#/db/models/kategori.server';
import { connectDB } from '#/db/mongoose.server';

export async function listKategori() {
  await connectDB();

  return Kategori.find().sort({ createdAt: 1 }).lean();
}
