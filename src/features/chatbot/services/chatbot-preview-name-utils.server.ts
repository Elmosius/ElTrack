import { cleanText } from '../chatbot.shared.server';

const leadingPreviewNoiseWords = new Set([
  'hai',
  'halo',
  'hi',
  'tolong',
  'please',
  'bisa',
  'bantu',
  'catat',
  'catetin',
  'catatkan',
  'dong',
  'ya',
  'yah',
  'aku',
  'saya',
  'tadi',
  'barusan',
  'nih',
]);

const trailingPreviewNoiseWords = new Set([
  'aja',
  'saja',
  'dong',
  'ya',
  'yah',
  'deh',
  'nih',
  'hehe',
  'wkwk',
  'pls',
  'please',
]);

export const renameLeadingNoiseWords = new Set([
  'aku',
  'saya',
  'mau',
  'ingin',
  'tolong',
  'dong',
  'ya',
  'yah',
  'nih',
  'ubah',
  'ganti',
  'gnti',
  'perbarui',
  'update',
  'rename',
  'nama',
  'namanya',
  'transaksi',
  'transaksinya',
  'menjadi',
  'jadi',
]);

export function normalizePreviewMessage(value: string) {
  return value
    .toLowerCase()
    .replace(/["'`”“]/g, ' ')
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripNoiseWords(tokens: string[]) {
  const nextTokens = [...tokens];

  while (
    nextTokens.length > 0 &&
    leadingPreviewNoiseWords.has(nextTokens[0] as string)
  ) {
    nextTokens.shift();
  }

  while (
    nextTokens.length > 0 &&
    trailingPreviewNoiseWords.has(nextTokens[nextTokens.length - 1] as string)
  ) {
    nextTokens.pop();
  }

  return nextTokens;
}

export function stripLeadingTokens(tokens: string[], blockedWords: Set<string>) {
  const nextTokens = [...tokens];

  while (nextTokens.length > 0 && blockedWords.has(nextTokens[0] as string)) {
    nextTokens.shift();
  }

  return nextTokens;
}

export function sanitizeTransactionNameCandidate(
  candidate: string | null | undefined,
  options: {
    maxWords?: number;
  } = {},
) {
  const { maxWords = 5 } = options;
  const normalized = normalizePreviewMessage(candidate ?? '');

  if (!normalized) {
    return null;
  }

  const strippedTokens = stripNoiseWords(normalized.split(' ').filter(Boolean));

  if (strippedTokens.length === 0 || strippedTokens.length > maxWords) {
    return null;
  }

  return cleanText(strippedTokens.join(' '));
}

export function looksLikeTransactionDetailMessage(
  value: string | null | undefined,
) {
  const normalized = normalizePreviewMessage(value ?? '');

  if (!normalized) {
    return false;
  }

  return /\d|\b(?:rp|idr|rb|ribu|juta|cash|tunai|qris|debit|kredit|transfer|siang|pagi|sore|malam|tanggal|jam|pukul|pakai|pake|isi|bensin|tambal|makan|belanja)\b/.test(
    normalized,
  );
}
