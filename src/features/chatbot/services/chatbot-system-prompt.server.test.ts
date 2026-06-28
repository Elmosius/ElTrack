import { describe, expect, it } from 'vitest';
import type { ChatbotMasterData } from '../chatbot.shared.server';
import type { ChatbotFinancialContext } from './chatbot-financial-context.server';
import { buildChatbotSystemPrompt } from './chatbot-system-prompt.server';

const masterData: ChatbotMasterData = {
  kategori: [{ id: 'kategori-1', name: 'Makan & Minum' }],
  metodePembayaran: [{ id: 'metode-1', name: 'QRIS' }],
  tipe: [{ id: 'tipe-1', name: 'Pengeluaran' }],
};

const financialContext: ChatbotFinancialContext = {
  generatedAt: '2026-06-28T00:00:00.000Z',
  period: {
    startMonth: '2026-01',
    endMonth: '2026-06',
    label: 'Januari 2026 sampai Juni 2026',
  },
  summary: {
    totalBalance: 1_000_000,
    cashBalance: 400_000,
    nonCashBalance: 600_000,
    currentMonthIncome: 2_000_000,
    currentMonthExpenses: 1_200_000,
    currentMonthNet: 800_000,
    averageDailyExpense: 40_000,
  },
  monthlyTrend: [
    {
      label: 'Jun',
      expenses: 1_200_000,
      income: 2_000_000,
    },
  ],
  topCategories: [
    {
      id: 'kategori-1',
      label: 'Makan & Minum',
      value: 600_000,
      percentageChange: 20,
      previousAmount: 500_000,
      trend: 'up',
    },
  ],
  topPaymentMethods: [],
  recentTransactions: [],
  largestExpenses: [],
  goals: {
    totalTarget: 5_000_000,
    totalCurrent: 1_500_000,
    totalRemaining: 3_500_000,
    activeGoalCount: 1,
    items: [],
  },
  langganan: {
    summary: {
      monthlyEstimate: 100_000,
      annualEstimate: 1_200_000,
      dueSoonCount: 1,
      overdueCount: 0,
    },
    reminders: [],
  },
  isEmpty: false,
};

describe('buildChatbotSystemPrompt', () => {
  it('keeps chat mode free from preview tool instructions and master data', () => {
    const prompt = buildChatbotSystemPrompt({
      mode: 'chat',
      masterData,
      activePreview: null,
      financialContext: null,
    });

    expect(prompt).not.toContain('preview_transaksi');
    expect(prompt).not.toContain('Daftar kategori');
    expect(prompt).not.toContain('Makan & Minum');
    expect(prompt).not.toContain('KONTEKS FINANSIAL READ-ONLY ELTRACK');
    expect(prompt).toContain('Jangan menampilkan JSON transaksi');
  });

  it('keeps preview mode focused on the preview tool contract', () => {
    const prompt = buildChatbotSystemPrompt({
      mode: 'preview',
      masterData,
      activePreview: null,
      financialContext,
    });

    expect(prompt).toContain('preview_transaksi');
    expect(prompt).toContain('Daftar kategori yang tersedia: Makan & Minum.');
    expect(prompt).not.toContain('KONTEKS FINANSIAL READ-ONLY ELTRACK');
    expect(prompt).not.toContain('Saldo total saat ini');
  });

  it('adds read-only financial context for savings advice', () => {
    const prompt = buildChatbotSystemPrompt({
      mode: 'chat',
      masterData,
      activePreview: null,
      financialContext,
    });

    expect(prompt).toContain('KONTEKS FINANSIAL READ-ONLY ELTRACK');
    expect(prompt).toContain('saran hemat');
    expect(prompt).toContain('"Makan & Minum": Rp 600.000');
    expect(prompt).toContain('Kamu tidak boleh mengubah Kantong');
  });
});
