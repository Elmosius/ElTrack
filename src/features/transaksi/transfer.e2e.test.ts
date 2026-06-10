import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { transferAntarKantongService } from './services/transfer.service.server';
import { getKantongPageDataService } from '#/features/kantong/services/kantong.service.server';
import { connectDB } from '#/db/mongoose.server';
import { Kantong } from '#/db/models/kantong.server';
import { Tipe } from '#/db/models/tipe.server';
import { Transaksi } from '#/db/models/transaksi.server';
import { Kategori } from '#/db/models/kategori.server';

describe('Transfer Antar Kantong - Opaque-Box E2E Tests', () => {
  beforeAll(async () => {
    await connectDB();
    // Ensure Tipe exists
    await Tipe.updateOne({ nama: 'Pengeluaran' }, { $setOnInsert: { nama: 'Pengeluaran' } }, { upsert: true });
    await Tipe.updateOne({ nama: 'Penghasilan' }, { $setOnInsert: { nama: 'Penghasilan' } }, { upsert: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  let userId: string;
  let sourceId: string;
  let destId: string;

  beforeEach(async () => {
    userId = crypto.randomUUID();

    // Create source kantong
    const source = await Kantong.create({
      userId,
      nama: 'Dompet',
      normalizedName: 'dompet',
      bucket: 'cash',
      openingBalance: 100000,
    });
    sourceId = source._id.toString();

    // Create dest kantong
    const dest = await Kantong.create({
      userId,
      nama: 'Tabungan',
      normalizedName: 'tabungan',
      bucket: 'cash',
      openingBalance: 50000,
    });
    destId = dest._id.toString();
  });

  afterEach(async () => {
    // Clean up test data for this specific user
    await Kantong.deleteMany({ userId });
    await Transaksi.deleteMany({ userId });
    await Kategori.deleteMany({ userId });
  });

  // Helper to recreate kantongs with different balances if needed in specific tests
  async function setBalances(sourceBal: number, destBal: number) {
    await Kantong.findByIdAndUpdate(sourceId, { openingBalance: sourceBal });
    await Kantong.findByIdAndUpdate(destId, { openingBalance: destBal });
  }

  describe('Tier 1: Feature Coverage', () => {
    it('Happy Path: Valid transfer between two distinct wallets with sufficient balance', async () => {
      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 20000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
          catatan: 'Test transfer',
        })
      ).resolves.not.toThrow();

      // Assert database state via Kantong Page Data Service
      const kantongData = await getKantongPageDataService(userId);
      const sourceKantong = kantongData.items.find(k => k._id.toString() === sourceId);
      const destKantong = kantongData.items.find(k => k._id.toString() === destId);

      // 100k - 20k = 80k
      expect(sourceKantong?.currentBalance).toBe(80000);
      // 50k + 20k = 70k
      expect(destKantong?.currentBalance).toBe(70000);

      // Verify Transaksi documents directly
      const transaksiList = await Transaksi.find({ userId });
      expect(transaksiList).toHaveLength(2);
      
      const pengeluaran = transaksiList.find(t => t.kantong?.toString() === sourceId);
      const penghasilan = transaksiList.find(t => t.kantong?.toString() === destId);

      expect(pengeluaran).toBeDefined();
      expect(penghasilan).toBeDefined();
      expect(pengeluaran?.nominal).toBe(20000);
      expect(penghasilan?.nominal).toBe(20000);
      
      // Ensure they are linked logically via transferId
      expect(pengeluaran?.transferId).toBeDefined();
      expect(penghasilan?.transferId).toBeDefined();
      expect(pengeluaran?.transferId).toBe(penghasilan?.transferId);
    });

    it('Identical Wallets', async () => {
      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: sourceId,
          nominal: 20000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });

    it('Insufficient Balance', async () => {
      await setBalances(10000, 50000);

      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 20000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });
  });

  describe('Tier 2: Boundary Value Analysis', () => {
    it('Exact Balance', async () => {
      await setBalances(20000, 0);

      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 20000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).resolves.not.toThrow();
      
      const kantongData = await getKantongPageDataService(userId);
      expect(kantongData.items.find(k => k._id.toString() === sourceId)?.currentBalance).toBe(0);
      expect(kantongData.items.find(k => k._id.toString() === destId)?.currentBalance).toBe(20000);
    });

    it('Zero Amount', async () => {
      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 0,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });

    it('Negative Amount', async () => {
      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: -10000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });
  });

  describe('Tier 3: Pairwise Combinatorial', () => {
    it('Source Empty -> Dest Empty, Valid amount: Rejected (insufficient)', async () => {
      await setBalances(0, 0);

      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 50000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });

    it('Source Funded -> Dest Empty, Negative amount: Rejected', async () => {
      await setBalances(100000, 0);

      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: -5000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });

    it('Source Empty -> Dest Funded, Zero amount: Rejected', async () => {
      await setBalances(0, 50000);

      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 0,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow();
    });
  });

  describe('Tier 4: Workload / Concurrency', () => {
    it('Race Condition: Two concurrent transfers from the same source', async () => {
      await setBalances(100000, 0);

      const t1 = transferAntarKantongService(userId, {
        sourceKantongId: sourceId,
        destKantongId: destId,
        nominal: 60000,
        tanggal: '2026-06-09',
        waktu: 'Siang',
      });
      const t2 = transferAntarKantongService(userId, {
        sourceKantongId: sourceId,
        destKantongId: destId,
        nominal: 60000,
        tanggal: '2026-06-09',
        waktu: 'Siang',
      });

      const results = await Promise.allSettled([t1, t2]);
      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter((r) => r.status === 'rejected');

      // Only one should succeed since 60k + 60k > 100k
      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);

      // Verify the final balance directly to ensure only 60k was transferred
      const kantongData = await getKantongPageDataService(userId);
      expect(kantongData.items.find(k => k._id.toString() === sourceId)?.currentBalance).toBe(40000);
      expect(kantongData.items.find(k => k._id.toString() === destId)?.currentBalance).toBe(60000);
    });

    it('Atomicity: Simulate a failure during the second step', async () => {
      await setBalances(100000, 0);

      const TransaksiService = await import('./services/transaksi.service.server');
      const createSpy = vi.spyOn(TransaksiService, 'createManyTransaksiService').mockRejectedValue(new Error('DB Error'));

      await expect(
        transferAntarKantongService(userId, {
          sourceKantongId: sourceId,
          destKantongId: destId,
          nominal: 20000,
          tanggal: '2026-06-09',
          waktu: 'Siang',
        })
      ).rejects.toThrow('DB Error');

      createSpy.mockRestore();

      // Assert balance is unchanged
      const kantongData = await getKantongPageDataService(userId);
      expect(kantongData.items.find(k => k._id.toString() === sourceId)?.currentBalance).toBe(100000);
      expect(kantongData.items.find(k => k._id.toString() === destId)?.currentBalance).toBe(0);
    });
  });
});
