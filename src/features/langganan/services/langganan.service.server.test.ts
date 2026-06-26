import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findKategoriByName: vi.fn(),
  insertKategori: vi.fn(),
  findKantongByIdsAndUserId: vi.fn(),
  getKantongPageDataService: vi.fn(),
  createTransaksiService: vi.fn(),
  findTipeList: vi.fn(),
  runWithOptionalTransaction: vi.fn(),
  deleteLanggananByIdAndUserId: vi.fn(),
  findLanggananByIdAndUserId: vi.fn(),
  findLanggananListByUserId: vi.fn(),
  insertLangganan: vi.fn(),
  markLanggananPaidById: vi.fn(),
  setLanggananStatusById: vi.fn(),
  updateLanggananById: vi.fn(),
}));

vi.mock('#/db/mongoose.server', () => ({
  runWithOptionalTransaction: mocks.runWithOptionalTransaction,
}));

vi.mock('#/features/kategori/repositories/kategori.repository.server', () => ({
  findKategoriByName: mocks.findKategoriByName,
  insertKategori: mocks.insertKategori,
}));

vi.mock('#/features/kantong/repositories/kantong.repository.server', () => ({
  findKantongByIdsAndUserId: mocks.findKantongByIdsAndUserId,
}));

vi.mock('#/features/kantong/services/kantong.service.server', () => ({
  getKantongPageDataService: mocks.getKantongPageDataService,
}));

vi.mock('#/features/transaksi/services/transaksi.service.server', () => ({
  createTransaksiService: mocks.createTransaksiService,
}));

vi.mock('#/features/tipe/repositories/tipe.repository.server', () => ({
  findTipeList: mocks.findTipeList,
}));

vi.mock('../repositories/langganan.repository.server', () => ({
  deleteLanggananByIdAndUserId: mocks.deleteLanggananByIdAndUserId,
  findLanggananByIdAndUserId: mocks.findLanggananByIdAndUserId,
  findLanggananListByUserId: mocks.findLanggananListByUserId,
  insertLangganan: mocks.insertLangganan,
  markLanggananPaidById: mocks.markLanggananPaidById,
  setLanggananStatusById: mocks.setLanggananStatusById,
  updateLanggananById: mocks.updateLanggananById,
}));

import {
  createLanggananService,
  deleteLanggananService,
  payLanggananService,
  updateLanggananService,
} from './langganan.service.server';

const userId = 'user-1';
const kategoriId = '507f1f77bcf86cd799439011';
const kantongId = '507f1f77bcf86cd799439012';
const langgananId = '507f1f77bcf86cd799439013';
const tipeId = '507f1f77bcf86cd799439014';
const transaksiId = '507f1f77bcf86cd799439015';

const langgananInput = {
  nama: 'Netflix',
  nominal: 75_000,
  frequency: 'bulanan' as const,
  nextDueDate: '2026-06-28',
  reminderDays: 3,
  kantong: kantongId,
  status: 'aktif' as const,
  catatan: '',
};

function createLanggananDoc(overrides: Record<string, unknown> = {}) {
  return {
    toObject: () => ({
      _id: langgananId,
      userId,
      ...langgananInput,
      ...overrides,
    }),
  };
}

function mockValidReferences() {
  mocks.findKantongByIdsAndUserId.mockResolvedValue([{ _id: kantongId }]);
}

describe('langganan service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidReferences();
    mocks.runWithOptionalTransaction.mockImplementation((operation) =>
      operation('session-1'),
    );
  });

  it('rejects update when kantong does not belong to user', async () => {
    mocks.findKantongByIdsAndUserId.mockResolvedValue([]);

    await expect(
      updateLanggananService(userId, {
        id: langgananId,
        ...langgananInput,
      }),
    ).rejects.toThrow('Kantong tidak ditemukan.');
    expect(mocks.updateLanggananById).not.toHaveBeenCalled();
  });

  it('creates langganan using the active user id after reference validation', async () => {
    mocks.insertLangganan.mockResolvedValue(createLanggananDoc());

    await createLanggananService(userId, langgananInput);

    expect(mocks.insertLangganan).toHaveBeenCalledWith(userId, langgananInput);
  });

  it('deletes langganan using the active user id', async () => {
    mocks.deleteLanggananByIdAndUserId.mockResolvedValue({ _id: langgananId });

    await deleteLanggananService(userId, { id: langgananId });

    expect(mocks.deleteLanggananByIdAndUserId).toHaveBeenCalledWith(userId, {
      id: langgananId,
    });
  });

  it('records payment as Pengeluaran and advances the next due date', async () => {
    mocks.findLanggananByIdAndUserId.mockResolvedValue({
      _id: langgananId,
      userId,
      ...langgananInput,
    });
    mocks.findTipeList.mockResolvedValue([{ _id: tipeId, nama: 'Pengeluaran' }]);
    mocks.findKategoriByName.mockResolvedValue({ _id: kategoriId, nama: 'Langganan' });
    mocks.createTransaksiService.mockResolvedValue({ _id: transaksiId });
    mocks.markLanggananPaidById.mockResolvedValue(
      createLanggananDoc({
        nextDueDate: '2026-07-28',
        lastPaidAt: '2026-06-26',
        lastTransactionId: transaksiId,
      }),
    );

    await payLanggananService(userId, {
      id: langgananId,
      tanggal: '2026-06-26',
    });

    expect(mocks.createTransaksiService).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        namaTransaksi: 'Langganan Netflix',
        tanggal: '2026-06-26',
        waktu: 'Pagi',
        nominal: 75_000,
        kategori: kategoriId,
        kantong: kantongId,
        tipe: tipeId,
        langgananId,
      }),
      { session: 'session-1' },
    );
    expect(mocks.markLanggananPaidById).toHaveBeenCalledWith(
      userId,
      langgananId,
      {
        nextDueDate: '2026-07-28',
        lastPaidAt: '2026-06-26',
        lastTransactionId: transaksiId,
      },
      { session: 'session-1' },
    );
  });

  it('creates the Langganan kategori when payment is recorded and it does not exist yet', async () => {
    const createdKategoriId = '507f1f77bcf86cd799439016';
    mocks.findLanggananByIdAndUserId.mockResolvedValue({
      _id: langgananId,
      userId,
      ...langgananInput,
    });
    mocks.findTipeList.mockResolvedValue([{ _id: tipeId, nama: 'Pengeluaran' }]);
    mocks.findKategoriByName.mockResolvedValue(null);
    mocks.insertKategori.mockResolvedValue({ _id: createdKategoriId, nama: 'Langganan' });
    mocks.createTransaksiService.mockResolvedValue({ _id: transaksiId });
    mocks.markLanggananPaidById.mockResolvedValue(
      createLanggananDoc({
        nextDueDate: '2026-07-28',
        lastPaidAt: '2026-06-26',
        lastTransactionId: transaksiId,
      }),
    );

    await payLanggananService(userId, {
      id: langgananId,
      tanggal: '2026-06-26',
    });

    expect(mocks.insertKategori).toHaveBeenCalledWith(userId, {
      nama: 'Langganan',
    });
    expect(mocks.createTransaksiService).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        kategori: createdKategoriId,
        langgananId,
      }),
      { session: 'session-1' },
    );
  });

  it('rejects payment for paused langganan', async () => {
    mocks.findLanggananByIdAndUserId.mockResolvedValue({
      _id: langgananId,
      userId,
      ...langgananInput,
      status: 'dijeda',
    });

    await expect(
      payLanggananService(userId, {
        id: langgananId,
        tanggal: '2026-06-26',
      }),
    ).rejects.toThrow('Langganan dijeda.');
    expect(mocks.createTransaksiService).not.toHaveBeenCalled();
  });
});
