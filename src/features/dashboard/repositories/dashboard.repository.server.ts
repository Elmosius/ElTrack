import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';

export async function findDashboardTransaksiByUserIdAndDateRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  await connectDB();

  return Transaksi.find({
    userId,
    tanggal: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate('kategori metodePembayaran tipe')
    .sort({ tanggal: -1, createdAt: -1 })
    .lean();
}
