import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TransaksiPreviewGroup } from '#/types/chatbot';
import { previewDismissedMarkerText } from '#/lib/chatbot';

const mocks = vi.hoisted(() => ({
  createManyTransaksi: vi.fn(),
  runWithOptionalTransaction: vi.fn(),
  getChatSessionOrThrow: vi.fn(),
  getChatbotMasterData: vi.fn(),
  storeChatMessageForSession: vi.fn(),
  updateChatSessionPendingPreviewService: vi.fn(),
}));

vi.mock('#/features/transaksi/transaksi.server', () => ({
  createManyTransaksi: mocks.createManyTransaksi,
}));

vi.mock('#/db/mongoose.server', () => ({
  runWithOptionalTransaction: mocks.runWithOptionalTransaction,
}));

vi.mock('./chatbot-session.service.server', () => ({
  getChatSessionOrThrow: mocks.getChatSessionOrThrow,
  storeChatMessageForSession: mocks.storeChatMessageForSession,
  updateChatSessionPendingPreviewService: mocks.updateChatSessionPendingPreviewService,
}));

vi.mock('./chatbot-master-data.service.server', () => ({
  getChatbotMasterData: mocks.getChatbotMasterData,
}));

const {
  buildResolvedPreview,
  confirmChatbotPreviewService,
  dismissChatbotPreviewService,
  patchChatbotPreviewItemService,
} = await import('./chatbot-preview.service.server');

const userId = 'user-1';
const chatSessionId = '507f1f77bcf86cd799439011';
const kategoriId = '507f1f77bcf86cd799439012';
const metodePembayaranId = '507f1f77bcf86cd799439013';
const tipeId = '507f1f77bcf86cd799439014';
const bensinKategoriId = '507f1f77bcf86cd799439015';
const qrisKantongId = '507f1f77bcf86cd799439016';
const penghasilanTipeId = '507f1f77bcf86cd799439017';
const sessionSummary = {
  id: chatSessionId,
  title: 'Chat baru',
  status: 'active',
  lastMessageAt: null,
  lastOpenedAt: null,
  createdAt: null,
  updatedAt: null,
};

const preview: TransaksiPreviewGroup = {
  items: [
    {
      namaTransaksi: 'Kopi',
      tanggal: '2026-05-01',
      nominal: 25000,
      waktu: 'Pagi',
      kategoriName: 'Makan',
      kategoriId,
      metodePembayaranName: 'Tunai',
      metodePembayaranId,
      tipeName: 'Pengeluaran',
      tipeId,
      catatan: null,
      confidenceNotes: [],
      missingFields: [],
      canConfirm: true,
    },
    {
      namaTransaksi: 'Teh',
      tanggal: '2026-05-01',
      nominal: 15000,
      waktu: 'Siang',
      kategoriName: 'Makan',
      kategoriId,
      metodePembayaranName: 'Tunai',
      metodePembayaranId,
      tipeName: 'Pengeluaran',
      tipeId,
      catatan: 'hangat',
      confidenceNotes: [],
      missingFields: [],
      canConfirm: true,
    },
  ],
  confidenceNotes: [],
  missingFields: [],
  canConfirm: true,
};

const masterData = {
  kategori: [
    { id: kategoriId, name: 'Makan' },
    { id: bensinKategoriId, name: 'Bensin' },
  ],
  metodePembayaran: [
    { id: metodePembayaranId, name: 'Tunai' },
    { id: qrisKantongId, name: 'QRIS' },
  ],
  tipe: [
    { id: tipeId, name: 'Pengeluaran' },
    { id: penghasilanTipeId, name: 'Penghasilan' },
  ],
};

describe('patchChatbotPreviewItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getChatSessionOrThrow.mockResolvedValue({ pendingPreview: preview });
    mocks.getChatbotMasterData.mockResolvedValue(masterData);
    mocks.updateChatSessionPendingPreviewService.mockResolvedValue(sessionSummary);
  });

  it('updates one preview item by index without changing the other items', async () => {
    const result = await patchChatbotPreviewItemService(userId, {
      chatSessionId,
      itemIndex: 1,
      patch: {
        nominal: 'Rp 17.000',
        kategoriId: bensinKategoriId,
        metodePembayaranId: qrisKantongId,
        tipeId: penghasilanTipeId,
      },
    });

    expect(result.items[0]).toMatchObject({
      namaTransaksi: 'Kopi',
      nominal: 25000,
      kategoriId,
      metodePembayaranId,
      tipeId,
    });
    expect(result.items[1]).toMatchObject({
      namaTransaksi: 'Teh',
      nominal: 17000,
      kategoriName: 'Bensin',
      kategoriId: bensinKategoriId,
      metodePembayaranName: 'QRIS',
      metodePembayaranId: qrisKantongId,
      tipeName: 'Penghasilan',
      tipeId: penghasilanTipeId,
      canConfirm: true,
    });
    expect(mocks.updateChatSessionPendingPreviewService).toHaveBeenCalledWith(
      userId,
      chatSessionId,
      result,
    );
  });

  it('recalculates missing fields when a required value is cleared', async () => {
    const result = await patchChatbotPreviewItemService(userId, {
      chatSessionId,
      itemIndex: 0,
      patch: {
        namaTransaksi: null,
      },
    });

    expect(result.canConfirm).toBe(false);
    expect(result.items[0]).toMatchObject({
      namaTransaksi: null,
      canConfirm: false,
    });
    expect(result.items[0]?.missingFields).toContain(
      'Nama transaksi belum terisi.',
    );
    expect(result.missingFields).toContain(
      'Transaksi 1: Nama transaksi belum terisi.',
    );
  });

  it('rejects invalid option ids instead of saving a broken preview', async () => {
    await expect(
      patchChatbotPreviewItemService(userId, {
        chatSessionId,
        itemIndex: 0,
        patch: {
          kategoriId: '507f1f77bcf86cd799439099',
        },
      }),
    ).rejects.toThrow('Kategori tidak ditemukan.');

    expect(mocks.updateChatSessionPendingPreviewService).not.toHaveBeenCalled();
  });
});

describe('confirmChatbotPreviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getChatSessionOrThrow.mockResolvedValue({ pendingPreview: preview });
    mocks.updateChatSessionPendingPreviewService.mockResolvedValue(sessionSummary);
    mocks.storeChatMessageForSession.mockResolvedValue({});
    mocks.runWithOptionalTransaction.mockImplementation((operation) =>
      operation('mock-session'),
    );
  });

  it('saves all preview items in one batch and clears the preview', async () => {
    await expect(
      confirmChatbotPreviewService(userId, { chatSessionId }),
    ).resolves.toMatchObject({
      session: sessionSummary,
    });

    expect(mocks.createManyTransaksi).toHaveBeenCalledWith(
      userId,
      [
        expect.objectContaining({ namaTransaksi: 'Kopi', catatan: undefined }),
        expect.objectContaining({ namaTransaksi: 'Teh', catatan: 'hangat' }),
      ],
      { session: 'mock-session' },
    );
    expect(mocks.updateChatSessionPendingPreviewService).toHaveBeenCalledWith(
      userId,
      chatSessionId,
      null,
      { session: 'mock-session' },
    );
    expect(mocks.storeChatMessageForSession).toHaveBeenCalledTimes(1);
  });

  it('does not clear preview or persist assistant message when batch save fails', async () => {
    mocks.createManyTransaksi.mockRejectedValue(new Error('Kategori tidak ditemukan.'));

    await expect(
      confirmChatbotPreviewService(userId, { chatSessionId }),
    ).rejects.toThrow('Kategori tidak ditemukan.');

    expect(mocks.updateChatSessionPendingPreviewService).not.toHaveBeenCalled();
    expect(mocks.storeChatMessageForSession).not.toHaveBeenCalled();
  });
});

describe('dismissChatbotPreviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getChatSessionOrThrow.mockResolvedValue({ pendingPreview: preview });
    mocks.updateChatSessionPendingPreviewService.mockResolvedValue(sessionSummary);
    mocks.storeChatMessageForSession.mockResolvedValue({});
  });

  it('clears pending preview and stores an internal dismissal marker', async () => {
    await expect(
      dismissChatbotPreviewService(userId, chatSessionId),
    ).resolves.toEqual({
      session: sessionSummary,
      cleared: true,
    });

    expect(mocks.updateChatSessionPendingPreviewService).toHaveBeenCalledWith(
      userId,
      chatSessionId,
      null,
    );
    expect(mocks.storeChatMessageForSession).toHaveBeenCalledWith(
      userId,
      chatSessionId,
      expect.objectContaining({
        role: 'system',
        parts: [{ type: 'text', content: previewDismissedMarkerText }],
      }),
    );
  });
});

describe('buildResolvedPreview', () => {
  it('fills deterministic fallback fields for partial Gemini tool args', () => {
    const result = buildResolvedPreview(
      {
        items: [
          {
            tanggal: '2026-05-31',
            waktu: 'Pagi',
            nominal: 30000,
          },
        ],
      },
      {
        kategori: [{ id: kategoriId, name: 'Bensin' }],
        metodePembayaran: [{ id: metodePembayaranId, name: 'Tunai' }],
        tipe: [{ id: tipeId, name: 'Pengeluaran' }],
      },
      {
        latestUserMessage:
          'Tolong catat dong aku tadi pagi isi bensin 30rbu pake tunai',
      },
    );

    expect(result).toMatchObject({
      canConfirm: true,
      items: [
        {
          namaTransaksi: 'isi bensin',
          tanggal: '2026-05-31',
          waktu: 'Pagi',
          nominal: 30000,
          kategoriName: 'Bensin',
          kategoriId,
          metodePembayaranName: 'Tunai',
          metodePembayaranId,
          tipeName: 'Pengeluaran',
          tipeId,
          canConfirm: true,
        },
      ],
    });
    expect(result.missingFields).toEqual([]);
  });
});
