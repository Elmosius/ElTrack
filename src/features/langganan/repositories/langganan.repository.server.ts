import { Langganan } from '#/db/models/langganan.server';
import { connectDB } from '#/db/mongoose.server';
import type { ClientSession } from 'mongoose';
import type {
  CreateLanggananInput,
  DeleteLanggananInput,
  SetLanggananStatusInput,
  UpdateLanggananInput,
} from '../langganan.schema';

type RepositoryOptions = {
  session?: ClientSession;
};

function normalizeLanggananPayload(data: CreateLanggananInput) {
  return {
    nama: data.nama,
    nominal: data.nominal,
    frequency: data.frequency,
    nextDueDate: data.nextDueDate,
    reminderDays: data.reminderDays ?? 3,
    kantong: data.kantong,
    status: data.status ?? 'aktif',
    catatan: data.catatan || undefined,
  };
}

function buildLanggananUpdate(data: UpdateLanggananInput) {
  const setFields: Record<string, unknown> = {
    nama: data.nama,
    nominal: data.nominal,
    frequency: data.frequency,
    nextDueDate: data.nextDueDate,
    reminderDays: data.reminderDays ?? 3,
    kantong: data.kantong,
    status: data.status ?? 'aktif',
  };
  const unsetFields: Record<string, 1> = {};

  if (data.catatan) {
    setFields.catatan = data.catatan;
  } else {
    unsetFields.catatan = 1;
  }

  return Object.keys(unsetFields).length > 0
    ? {
        $set: setFields,
        $unset: unsetFields,
      }
    : {
        $set: setFields,
      };
}

export async function findLanggananListByUserId(userId: string) {
  await connectDB();

  return Langganan.find({ userId }).sort({ status: 1, nextDueDate: 1, createdAt: 1 }).lean();
}

export async function findLanggananByIdAndUserId(id: string, userId: string) {
  await connectDB();

  return Langganan.findOne({ _id: id, userId }).lean();
}

export async function insertLangganan(
  userId: string,
  data: CreateLanggananInput,
) {
  await connectDB();

  return Langganan.create({
    ...normalizeLanggananPayload(data),
    userId,
  });
}

export async function updateLanggananById(
  userId: string,
  data: UpdateLanggananInput,
) {
  await connectDB();

  return Langganan.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    buildLanggananUpdate(data),
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function setLanggananStatusById(
  userId: string,
  data: SetLanggananStatusInput,
) {
  await connectDB();

  return Langganan.findOneAndUpdate(
    {
      _id: data.id,
      userId,
    },
    {
      $set: {
        status: data.status,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function markLanggananPaidById(
  userId: string,
  id: string,
  data: {
    nextDueDate: string;
    lastPaidAt: string;
    lastTransactionId: string;
  },
  options: RepositoryOptions = {},
) {
  await connectDB();

  return Langganan.findOneAndUpdate(
    {
      _id: id,
      userId,
    },
    {
      $set: data,
    },
    {
      returnDocument: 'after',
      runValidators: true,
      session: options.session,
    },
  );
}

export async function deleteLanggananByIdAndUserId(
  userId: string,
  data: DeleteLanggananInput,
) {
  await connectDB();

  return Langganan.findOneAndDelete({
    _id: data.id,
    userId,
  });
}
