import { Kantong } from '#/db/models/kantong.server';
import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';
import type {
  ArchiveKantongInput,
  CreateKantongInput,
} from '../kantong.schema';

export async function countKantongByUserId(userId: string) {
  await connectDB();

  return Kantong.countDocuments({ userId });
}

export async function findKantongListByUserId(userId: string) {
  await connectDB();

  return Kantong.find({ userId })
    .sort({ archivedAt: 1, bucket: 1, createdAt: 1 })
    .lean();
}

export async function findActiveKantongListByUserId(userId: string) {
  await connectDB();

  return Kantong.find({ userId, archivedAt: null })
    .sort({ bucket: 1, createdAt: 1 })
    .lean();
}

export async function findKantongByIdsAndUserId(
  userId: string,
  ids: string[],
) {
  await connectDB();

  if (ids.length === 0) {
    return [];
  }

  return Kantong.find({
    _id: { $in: ids },
    userId,
  }).lean();
}

export async function insertKantong(
  userId: string,
  normalizedName: string,
  data: CreateKantongInput,
) {
  await connectDB();

  return Kantong.create({
    ...data,
    userId,
    normalizedName,
    activatedAt: new Date(),
  });
}

export async function insertKantongMany(
  userId: string,
  items: Array<CreateKantongInput & { normalizedName: string }>,
) {
  await connectDB();

  return Kantong.insertMany(
    items.map((item) => ({
      userId,
      nama: item.nama,
      normalizedName: item.normalizedName,
      bucket: item.bucket,
      openingBalance: item.openingBalance,
      activatedAt: new Date(),
    })),
    { ordered: true },
  );
}

export async function archiveKantongByIdAndUserId(
  userId: string,
  data: ArchiveKantongInput,
) {
  await connectDB();

  return Kantong.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    {
      $set: {
        archivedAt: new Date(),
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function unarchiveKantongByIdAndUserId(
  userId: string,
  data: ArchiveKantongInput,
) {
  await connectDB();

  return Kantong.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    {
      $set: {
        archivedAt: null,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function findKantongTransaksiByUserIdSince(
  userId: string,
  activatedAt: Date,
) {
  await connectDB();

  return Transaksi.find({
    userId,
    kantong: { $ne: null },
    createdAt: {
      $gte: activatedAt,
    },
  })
    .populate('kantong tipe')
    .lean();
}
