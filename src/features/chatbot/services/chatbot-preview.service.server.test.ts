import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TransaksiPreviewGroup } from '#/types/chatbot';

const mocks = vi.hoisted(() => ({
  createManyTransaksi: vi.fn(),
  runWithOptionalTransaction: vi.fn(),
  getChatSessionOrThrow: vi.fn(),
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

const { confirmChatbotPreviewService } = await import('./chatbot-preview.service.server');

const userId = 'user-1';
const chatSessionId = '507f1f77bcf86cd799439011';
const kategoriId = '507f1f77bcf86cd799439012';
const metodePembayaranId = '507f1f77bcf86cd799439013';
const tipeId = '507f1f77bcf86cd799439014';
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
