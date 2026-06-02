import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateTransaksiInput, UpdateTransaksiInput } from '../transaksi.schema';

const mocks = vi.hoisted(() => ({
  deleteTransaksiByIdAndUserId: vi.fn(),
  findTransaksiListByUserId: vi.fn(),
  insertTransaksi: vi.fn(),
  insertTransaksiMany: vi.fn(),
  updateTransaksiById: vi.fn(),
  findKategoriByIdsAndUserId: vi.fn(),
  findKantongByIdsAndUserId: vi.fn(),
  findMetodePembayaranByIds: vi.fn(),
  findTipeByIds: vi.fn(),
}));

vi.mock('../repositories/transaksi.repository.server', () => ({
  deleteTransaksiByIdAndUserId: mocks.deleteTransaksiByIdAndUserId,
  findTransaksiListByUserId: mocks.findTransaksiListByUserId,
  insertTransaksi: mocks.insertTransaksi,
  insertTransaksiMany: mocks.insertTransaksiMany,
  updateTransaksiById: mocks.updateTransaksiById,
}));

vi.mock('#/features/kategori/repositories/kategori.repository.server', () => ({
  findKategoriByIdsAndUserId: mocks.findKategoriByIdsAndUserId,
}));

vi.mock('#/features/kantong/repositories/kantong.repository.server', () => ({
  findKantongByIdsAndUserId: mocks.findKantongByIdsAndUserId,
}));

vi.mock('#/features/metode-pembayaran/repositories/metode-pembayaran.repository.server', () => ({
  findMetodePembayaranByIds: mocks.findMetodePembayaranByIds,
}));

vi.mock('#/features/tipe/repositories/tipe.repository.server', () => ({
  findTipeByIds: mocks.findTipeByIds,
}));

const {
  createManyTransaksiService,
  createTransaksiService,
  updateTransaksiService,
} = await import('./transaksi.service.server');

const userId = 'user-1';
const kategoriId = '507f1f77bcf86cd799439011';
const metodePembayaranId = '507f1f77bcf86cd799439012';
const tipeId = '507f1f77bcf86cd799439013';
const transaksiId = '507f1f77bcf86cd799439014';
const kantongId = '507f1f77bcf86cd799439016';

const baseInput: CreateTransaksiInput = {
  namaTransaksi: 'Kopi',
  tanggal: '2026-05-01',
  waktu: 'Pagi',
  nominal: 25000,
  kategori: kategoriId,
  kantong: kantongId,
  catatan: undefined,
  tipe: tipeId,
};

function transaksiDoc(input: CreateTransaksiInput, id = transaksiId) {
  return {
    toObject: () => ({
      _id: id,
      userId,
      ...input,
    }),
  };
}

function mockValidReferences() {
  mocks.findKategoriByIdsAndUserId.mockResolvedValue([{ _id: kategoriId }]);
  mocks.findKantongByIdsAndUserId.mockResolvedValue([{ _id: kantongId }]);
  mocks.findMetodePembayaranByIds.mockResolvedValue([{ _id: metodePembayaranId }]);
  mocks.findTipeByIds.mockResolvedValue([{ _id: tipeId }]);
}

describe('transaksi service reference validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidReferences();
  });

  it('rejects categories that do not belong to the user', async () => {
    mocks.findKategoriByIdsAndUserId.mockResolvedValue([]);

    await expect(createTransaksiService(userId, baseInput)).rejects.toThrow(
      'Kategori tidak ditemukan.',
    );
    expect(mocks.insertTransaksi).not.toHaveBeenCalled();
  });

  it('rejects invalid Kantong reference ids before saving', async () => {
    mocks.findKantongByIdsAndUserId.mockResolvedValue([]);

    await expect(createTransaksiService(userId, baseInput)).rejects.toThrow(
      'Kantong tidak ditemukan.',
    );
    expect(mocks.insertTransaksi).not.toHaveBeenCalled();
  });

  it('keeps legacy metode pembayaran validation for old transactions', async () => {
    const legacyInput: CreateTransaksiInput = {
      ...baseInput,
      kantong: undefined,
      metodePembayaran: metodePembayaranId,
    };

    mocks.findMetodePembayaranByIds.mockResolvedValue([]);

    await expect(createTransaksiService(userId, legacyInput)).rejects.toThrow(
      'Metode pembayaran tidak ditemukan.',
    );
    expect(mocks.insertTransaksi).not.toHaveBeenCalled();
  });

  it('creates and updates transactions when all references are valid', async () => {
    const updateInput: UpdateTransaksiInput = {
      ...baseInput,
      id: transaksiId,
      namaTransaksi: 'Makan siang',
    };
    mocks.insertTransaksi.mockResolvedValue(transaksiDoc(baseInput));
    mocks.updateTransaksiById.mockResolvedValue(transaksiDoc(updateInput));

    await expect(createTransaksiService(userId, baseInput)).resolves.toMatchObject({
      _id: transaksiId,
      namaTransaksi: 'Kopi',
    });
    await expect(updateTransaksiService(userId, updateInput)).resolves.toMatchObject({
      _id: transaksiId,
      namaTransaksi: 'Makan siang',
    });
    expect(mocks.insertTransaksi).toHaveBeenCalledWith(userId, baseInput, {});
    expect(mocks.updateTransaksiById).toHaveBeenCalledWith(userId, updateInput, {});
  });

  it('validates all references before batch insert', async () => {
    mocks.insertTransaksiMany.mockResolvedValue([
      transaksiDoc(baseInput, transaksiId),
      transaksiDoc({ ...baseInput, namaTransaksi: 'Teh' }, '507f1f77bcf86cd799439015'),
    ]);

    await expect(
      createManyTransaksiService(userId, [
        baseInput,
        { ...baseInput, namaTransaksi: 'Teh' },
      ]),
    ).resolves.toHaveLength(2);
    expect(mocks.insertTransaksiMany).toHaveBeenCalledTimes(1);
  });
});
