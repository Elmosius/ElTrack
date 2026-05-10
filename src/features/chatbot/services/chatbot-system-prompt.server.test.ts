import { describe, expect, it } from 'vitest';
import type { ChatbotMasterData } from '../chatbot.shared.server';
import { buildChatbotSystemPrompt } from './chatbot-system-prompt.server';

const masterData: ChatbotMasterData = {
  kategori: [{ id: 'kategori-1', name: 'Makan & Minum' }],
  metodePembayaran: [{ id: 'metode-1', name: 'QRIS' }],
  tipe: [{ id: 'tipe-1', name: 'Pengeluaran' }],
};

describe('buildChatbotSystemPrompt', () => {
  it('keeps chat mode free from preview tool instructions and master data', () => {
    const prompt = buildChatbotSystemPrompt({
      mode: 'chat',
      masterData,
      activePreview: null,
    });

    expect(prompt).not.toContain('preview_transaksi');
    expect(prompt).not.toContain('Daftar kategori');
    expect(prompt).not.toContain('Makan & Minum');
    expect(prompt).toContain('Jangan menampilkan JSON transaksi');
  });

  it('keeps preview mode focused on the preview tool contract', () => {
    const prompt = buildChatbotSystemPrompt({
      mode: 'preview',
      masterData,
      activePreview: null,
    });

    expect(prompt).toContain('preview_transaksi');
    expect(prompt).toContain('Daftar kategori yang tersedia: Makan & Minum.');
  });
});
