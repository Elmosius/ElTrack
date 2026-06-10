import crypto from 'node:crypto';
import { runWithOptionalTransaction } from '#/db/mongoose.server';
import { findTipeList } from '#/features/tipe/repositories/tipe.repository.server';
import { findKategoriListByUserId, insertKategori } from '#/features/kategori/repositories/kategori.repository.server';
import { findKantongByIdsAndUserId } from '#/features/kantong/repositories/kantong.repository.server';
import { createManyTransaksiService } from './transaksi.service.server';
import type { CreateTransferKantongInput } from '../transaksi.schema';

export async function transferAntarKantongService(
  userId: string,
  data: CreateTransferKantongInput,
) {
  if (data.sourceKantongId === data.destKantongId) {
    throw new Error('Kantong asal dan tujuan tidak boleh sama');
  }

  if (data.nominal <= 0) {
    throw new Error('Nominal harus lebih dari 0');
  }

  return runWithOptionalTransaction(async (session) => {
    // Induce a write-lock on the source Kantong document
    const { Kantong } = await import('#/db/models/kantong.server');
    await Kantong.findOneAndUpdate(
      { _id: data.sourceKantongId },
      { $set: { updatedAt: new Date() } },
      { session }
    );

    // Check balance using the kantong service inside the transaction
    const { getKantongPageDataService } = await import('#/features/kantong/services/kantong.service.server');
    const kantongData = await getKantongPageDataService(userId);
    const sourceKantongBalance = kantongData.items.find(k => k._id.toString() === data.sourceKantongId);
    if (!sourceKantongBalance || sourceKantongBalance.currentBalance < data.nominal) {
      throw new Error('Saldo tidak cukup');
    }

    // Fetch Tipe documents
    const tipeList = await findTipeList();
    const pengeluaranTipe = tipeList.find(t => t.nama === 'Pengeluaran');
    const penghasilanTipe = tipeList.find(t => t.nama === 'Penghasilan');

    if (!pengeluaranTipe || !penghasilanTipe) {
      throw new Error('Tipe Pengeluaran atau Penghasilan tidak ditemukan');
    }

    // Fetch Kategori 'Transfer' or create it
    const kategoriList = await findKategoriListByUserId(userId);
    let transferKategori = kategoriList.find(k => k.nama === 'Transfer');
    if (!transferKategori) {
      transferKategori = await insertKategori(userId, { nama: 'Transfer' });
    }

    // Fetch Kantong names
    const kantongs = await findKantongByIdsAndUserId(userId, [data.sourceKantongId, data.destKantongId]);
    const sourceKantong = kantongs.find(k => k._id.toString() === data.sourceKantongId);
    const destKantong = kantongs.find(k => k._id.toString() === data.destKantongId);

    if (!sourceKantong || !destKantong) {
      throw new Error('Kantong asal atau tujuan tidak ditemukan');
    }

    const transferId = crypto.randomUUID();

    const transaksiList = [
      {
        namaTransaksi: `Transfer ke ${destKantong.nama}`,
        tanggal: data.tanggal,
        waktu: data.waktu,
        nominal: data.nominal,
        kategori: transferKategori._id.toString(),
        kantong: data.sourceKantongId,
        catatan: data.catatan,
        tipe: pengeluaranTipe._id.toString(),
        transferId,
      },
      {
        namaTransaksi: `Transfer dari ${sourceKantong.nama}`,
        tanggal: data.tanggal,
        waktu: data.waktu,
        nominal: data.nominal,
        kategori: transferKategori._id.toString(),
        kantong: data.destKantongId,
        catatan: data.catatan,
        tipe: penghasilanTipe._id.toString(),
        transferId,
      }
    ];

    const result = await createManyTransaksiService(userId, transaksiList, { session });
    return result;
  });
}
