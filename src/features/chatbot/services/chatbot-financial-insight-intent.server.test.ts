import { describe, expect, it } from 'vitest';
import {
  classifyFinancialInsightIntent,
  shouldIncludeChatbotFinancialContext,
} from './chatbot-financial-insight-intent.server';

describe('classifyFinancialInsightIntent', () => {
  it.each([
    'kasih saran hemat',
    'aku boros di mana',
    'gimana kondisi bulan ini',
    'tagihan apa yang dekat',
    'progress goals gimana',
    'pengeluaran kategori mana yang naik',
    'Ada risiko yang perlu dicek?',
  ])('detects "%s" as a financial insight request', (message) => {
    expect(classifyFinancialInsightIntent(message)).toBe(true);
  });

  it.each([
    'hai kamu siapa',
    'bisa bantu apa',
    'halo',
    'apa kabar',
    'ceritain fitur kamu dong',
    'apa itu transaksi?',
    'apa bedanya kategori dan kantong?',
    'bulan itu dihitung dari tanggal berapa?',
  ])('keeps "%s" as generic chat', (message) => {
    expect(classifyFinancialInsightIntent(message)).toBe(false);
  });

  it('never includes financial context outside chat mode', () => {
    expect(
      shouldIncludeChatbotFinancialContext({
        previewIntent: 'new-preview',
        latestUserMessage: 'catat transaksi makan 25000 dan cek pengeluaran',
      }),
    ).toBe(false);
    expect(
      shouldIncludeChatbotFinancialContext({
        previewIntent: 'update-preview',
        latestUserMessage: 'kategori transaksi ini makan minum',
      }),
    ).toBe(false);
  });
});
