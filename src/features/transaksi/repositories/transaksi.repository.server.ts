import { Transaksi } from '#/db/models/transaksi.server';
import { connectDB } from '#/db/mongoose.server';
import type { ClientSession } from 'mongoose';
import type {
  CreateTransaksiInput,
  DeleteTransaksiInput,
  UpdateTransaksiInput,
} from '../transaksi.schema';

type RepositoryOptions = {
  session?: ClientSession;
};

export async function findTransaksiListByUserId(userId: string) {
  await connectDB();

  return Transaksi.find({ userId })
    .populate('kategori kantong metodePembayaran tipe')
    .sort({ createdAt: 1 })
    .lean();
}

export async function insertTransaksi(
  userId: string,
  data: CreateTransaksiInput,
  options: RepositoryOptions = {},
) {
  await connectDB();

  const [transaksi] = await Transaksi.create([{
    ...data,
    userId,
  }], {
    session: options.session,
  });

  return transaksi;
}

export async function insertTransaksiMany(
  userId: string,
  list: CreateTransaksiInput[],
  options: RepositoryOptions = {},
) {
  await connectDB();

  return Transaksi.insertMany(
    list.map((data) => ({
      ...data,
      userId,
    })),
    {
      ordered: true,
      session: options.session,
    },
  );
}

export async function updateTransaksiById(
  userId: string,
  data: UpdateTransaksiInput,
  options: RepositoryOptions = {},
) {
  await connectDB();
  const updateFields: Record<string, unknown> = {
    namaTransaksi: data.namaTransaksi,
    tanggal: data.tanggal,
    waktu: data.waktu,
    nominal: data.nominal,
    kategori: data.kategori,
    catatan: data.catatan,
    tipe: data.tipe,
  };
  const unsetFields: Record<string, 1> = {};

  if (data.kantong) {
    updateFields.kantong = data.kantong;
    unsetFields.metodePembayaran = 1;
  } else if (data.metodePembayaran) {
    updateFields.metodePembayaran = data.metodePembayaran;
    unsetFields.kantong = 1;
  }

  return Transaksi.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    Object.keys(unsetFields).length > 0
      ? {
          $set: updateFields,
          $unset: unsetFields,
        }
      : {
          $set: updateFields,
        },
    {
      returnDocument: 'after',
      runValidators: true,
      session: options.session,
    },
  );
}

export async function deleteTransaksiByIdAndUserId(
  userId: string,
  data: DeleteTransaksiInput,
  options: RepositoryOptions = {},
) {
  await connectDB();

  return Transaksi.findOneAndDelete({
    _id: data.id,
    userId,
  }, {
    session: options.session,
  });
}

export async function findTransaksiByIdAndUserId(
  id: string,
  userId: string,
) {
  await connectDB();
  return Transaksi.findOne({ _id: id, userId }).lean();
}

export async function deleteTransaksiByTransferIdAndUserId(
  transferId: string,
  userId: string,
  options: RepositoryOptions = {},
) {
  await connectDB();
  return Transaksi.deleteMany({ transferId, userId }, { session: options.session });
}
