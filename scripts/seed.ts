import type { Model } from 'mongoose';
import mongoose from 'mongoose';

import { Kategori, type KategoriDoc } from '../src/db/models/kategori.server';
import { MetodePembayaran, type MetodePembayaranDoc } from '../src/db/models/metode-pembayaran.server';
import { Tipe, type TipeDoc } from '../src/db/models/tipe.server';
import { Waktu, type WaktuDoc } from '../src/db/models/waktu.server';
import { connectDB } from '../src/db/mongoose.server';

const waktuDefault = ['Pagi', 'Siang', 'Sore', 'Malam'] as const;
const kategoriDefault = ['Makan & Minum', 'Jajan', 'Parkir', 'Bensin'] as const;
const metodePembayaranDefault = ['Tunai', 'Bank', 'QRIS', 'Flazz'] as const;
const tipeDefault = ['Pengeluaran', 'Penghasilan'] as const;

async function seedNamaCollection<T extends { nama: string }>(model: Model<T>, label: string, items: readonly string[]) {
  const operations = items.map((nama) => ({
    updateOne: {
      filter: { nama },
      update: { $setOnInsert: { nama } },
      upsert: true,
    },
  })) as Parameters<typeof model.bulkWrite>[0];

  const result = await model.bulkWrite(operations);

  console.log(`${label}: ${items.length} dicek, ${result.upsertedCount ?? 0} data baru ditambahkan.`);
}

async function main() {
  await connectDB();

  await seedNamaCollection<WaktuDoc>(Waktu, 'Waktu', waktuDefault);
  await seedNamaCollection<KategoriDoc>(Kategori, 'Kategori', kategoriDefault);
  await seedNamaCollection<MetodePembayaranDoc>(MetodePembayaran, 'Metode pembayaran', metodePembayaranDefault);
  await seedNamaCollection<TipeDoc>(Tipe, 'Tipe', tipeDefault);

  console.log('Seed default selesai.');
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
