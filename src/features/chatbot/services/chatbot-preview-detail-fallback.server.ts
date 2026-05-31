import type { PreviewTransaksiToolInput } from '../chatbot.schema';
import {
  cleanText,
  findBestOptionMatch,
  normalizeText,
  type ChatbotMasterData,
} from '../chatbot.shared.server';

type PreviewToolItemInput = PreviewTransaksiToolInput['items'][number];
type TipeName = NonNullable<PreviewToolItemInput['tipeName']>;

function hasAnyAlias(text: string, aliases: string[]) {
  return aliases.some((alias) => text.includes(alias));
}

function findAvailableOptionName(
  options: ChatbotMasterData['kategori'],
  candidates: string[],
) {
  for (const candidate of candidates) {
    const option = findBestOptionMatch(options, candidate);

    if (option) {
      return option.name;
    }
  }

  return null;
}

function resolveFallbackKategoriName(
  normalizedMessage: string,
  masterData: ChatbotMasterData,
) {
  if (hasAnyAlias(normalizedMessage, ['bensin', 'bbm', 'pertalite', 'pertamax'])) {
    return findAvailableOptionName(masterData.kategori, ['Bensin']);
  }

  if (hasAnyAlias(normalizedMessage, ['tambal ban', 'tambal bang', 'servis motor'])) {
    return findAvailableOptionName(masterData.kategori, [
      'Permotoran',
      'Transportasi',
    ]);
  }

  if (hasAnyAlias(normalizedMessage, ['makan', 'minum', 'kopi', 'jajan'])) {
    return findAvailableOptionName(masterData.kategori, [
      'Makan & Minum',
      'Makanan',
      'Makan',
    ]);
  }

  return null;
}

function resolveFallbackMetodePembayaranName(
  normalizedMessage: string,
  masterData: ChatbotMasterData,
) {
  if (hasAnyAlias(normalizedMessage, ['tunai', 'cash'])) {
    return findAvailableOptionName(masterData.metodePembayaran, [
      'Tunai',
      'Cash',
    ]);
  }

  if (normalizedMessage.includes('qris')) {
    return findAvailableOptionName(masterData.metodePembayaran, ['QRIS']);
  }

  if (hasAnyAlias(normalizedMessage, ['transfer', 'bank'])) {
    return findAvailableOptionName(masterData.metodePembayaran, [
      'Transfer Bank',
      'Bank',
    ]);
  }

  if (normalizedMessage.includes('debit')) {
    return findAvailableOptionName(masterData.metodePembayaran, ['Debit']);
  }

  if (normalizedMessage.includes('kredit')) {
    return findAvailableOptionName(masterData.metodePembayaran, ['Kredit']);
  }

  if (
    hasAnyAlias(normalizedMessage, [
      'e wallet',
      'ewallet',
      'gopay',
      'ovo',
      'dana',
      'shopeepay',
    ])
  ) {
    return findAvailableOptionName(masterData.metodePembayaran, [
      'E-Wallet',
      'E Wallet',
      'Dompet Digital',
    ]);
  }

  return null;
}

function resolveFallbackTipeName(
  normalizedMessage: string,
  masterData: ChatbotMasterData,
): TipeName | null {
  const hasPenghasilan = hasAnyAlias(normalizedMessage, [
    'gaji',
    'gajian',
    'terima',
    'dapat',
    'pemasukan',
    'penghasilan',
  ]);
  const hasPengeluaran = hasAnyAlias(normalizedMessage, [
    'beli',
    'bayar',
    'isi',
    'tambal',
    'makan',
    'minum',
    'belanja',
    'pengeluaran',
  ]);

  if (
    hasPenghasilan &&
    findBestOptionMatch(masterData.tipe, 'Penghasilan')
  ) {
    return 'Penghasilan';
  }

  if (
    hasPengeluaran &&
    findBestOptionMatch(masterData.tipe, 'Pengeluaran')
  ) {
    return 'Pengeluaran';
  }

  return null;
}

export function applyDeterministicPreviewFallbacks(
  item: PreviewToolItemInput,
  masterData: ChatbotMasterData,
  latestUserMessage: string | null | undefined,
): PreviewToolItemInput {
  const normalizedMessage = normalizeText(latestUserMessage ?? '');

  if (!normalizedMessage) {
    return item;
  }

  const fallbackKategoriName = resolveFallbackKategoriName(
    normalizedMessage,
    masterData,
  );
  const fallbackMetodePembayaranName = resolveFallbackMetodePembayaranName(
    normalizedMessage,
    masterData,
  );
  const fallbackTipeName = resolveFallbackTipeName(
    normalizedMessage,
    masterData,
  );

  return {
    ...item,
    kategoriName: cleanText(item.kategoriName) ?? fallbackKategoriName,
    metodePembayaranName:
      cleanText(item.metodePembayaranName) ?? fallbackMetodePembayaranName,
    tipeName: item.tipeName ?? fallbackTipeName,
  };
}
