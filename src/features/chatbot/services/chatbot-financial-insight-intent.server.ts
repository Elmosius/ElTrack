import { normalizeText } from '../chatbot.shared.server';
import type { PreviewIntent } from './chatbot-preview-intent.server';

const directInsightPhrasePattern =
  /\b(saran hemat|boros di mana|kondisi bulan ini|risiko yang perlu dicek|cek kondisi|cek risiko|review keuangan|analisis keuangan|insight keuangan)\b/;

const dueInsightPhrasePattern =
  /\b(tagihan|langganan|subscription)\b.*\b(dekat|jatuh tempo|overdue|telat|terlambat)\b/;

const personalSignalPattern =
  /\b(aku|saya|ku|bulanku|bulananku|keuanganku|finansialku|pengeluaranku|pemasukanku|saldoku|budgetku|anggaranku|goalku|targetku|tabunganku|investasiku|langgananku|tagihanku)\b/;

const insightActionPattern =
  /\b(saran|rekomendasi|cek|review|analisis|analisa|evaluasi|audit|ringkas|rangkum|lihat|pantau|kontrol|kurangi|hemat|risiko|risk|boros|kondisi|progress|progres|naik|turun|overdue|jatuh tempo)\b/;

const financialTopicPattern =
  /\b(cashflow|arus kas|goal|goals|target|tabungan|menabung|investasi|langganan|subscription|tagihan|jatuh tempo|overdue|saldo|pengeluaran|pemasukan|kategori|transaksi|kantong|budget|anggaran|keuangan|finansial|hemat|boros|risiko)\b/;

const genericChatPattern =
  /^(hai|halo|hello|hi|helo|test|testing|tes|coba|ping|apa kabar|bisa bantu apa|kamu siapa|siapa kamu)(\s+.*)?$/;

export function classifyFinancialInsightIntent(
  latestUserMessage: string | null,
) {
  const normalizedText = normalizeText(latestUserMessage ?? '');

  if (!normalizedText || genericChatPattern.test(normalizedText)) {
    return false;
  }

  if (directInsightPhrasePattern.test(normalizedText)) {
    return true;
  }

  if (dueInsightPhrasePattern.test(normalizedText)) {
    return true;
  }

  return (
    financialTopicPattern.test(normalizedText) &&
    (personalSignalPattern.test(normalizedText) ||
      insightActionPattern.test(normalizedText))
  );
}

export function shouldIncludeChatbotFinancialContext({
  previewIntent,
  latestUserMessage,
}: {
  previewIntent: PreviewIntent;
  latestUserMessage: string | null;
}) {
  return (
    previewIntent === 'chat' &&
    classifyFinancialInsightIntent(latestUserMessage)
  );
}
