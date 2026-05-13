import { BalanceSettings } from '#/db/models/balance-settings.server';
import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';
import type { UpsertBalanceSettingsInput } from '../balance.schema';

export async function findBalanceSettingsByUserId(userId: string) {
  await connectDB();

  return BalanceSettings.findOne({ userId }).lean();
}

export async function upsertBalanceSettingsByUserId(
  userId: string,
  data: UpsertBalanceSettingsInput,
) {
  await connectDB();

  return BalanceSettings.findOneAndUpdate(
    { userId },
    {
      $set: {
        openingCash: data.openingCash,
        openingNonCash: data.openingNonCash,
      },
      $setOnInsert: {
        userId,
        activatedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  );
}

export async function findBalanceTransaksiByUserIdSince(
  userId: string,
  activatedAt: Date,
) {
  await connectDB();

  return Transaksi.find({
    userId,
    createdAt: {
      $gte: activatedAt,
    },
  })
    .populate('metodePembayaran tipe')
    .lean();
}
