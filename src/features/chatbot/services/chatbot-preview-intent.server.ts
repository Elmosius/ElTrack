import { normalizeText } from '../chatbot.shared.server';
import type { TransaksiPreviewGroup } from '#/types/chatbot';

export type PreviewIntent = 'new-preview' | 'update-preview' | 'chat';

const nominalPattern =
  /\b(?:rp\s*)?\d+(?:[.,]\d+)?\s*(?:rb|rbu|ribu|k|jt|juta)?\b/i;

const createPreviewRequestPattern =
  /\b(catat|catetin|masukin|tambahkan|buatkan|buat)\b/;

const transactionDetailPattern =
  /\b(beli|bayar|isi|tambal|top up|topup|transfer|gajian|terima|dapat|makan|minum|cash|tunai|qris|bank|bensin|struk)\b/;

const correctionPattern =
  /\b(tanggal|tanggalnya|tgl|waktu|waktunya|jam|jamnya|nama|namanya|transaksi|transaksinya|kategori|kategorinya|metode|metodenya|pembayaran|pembayarannya|tipe|tipenya|catatan|catatannya|nominal|nominalnya|jumlah|jumlahnya|harga|harganya|total|totalnya|ganti|ubah|perbarui|update|revisi|koreksi|bukan|maksudnya|harusnya|jadi|menjadi|pertama|kedua|ketiga|keempat|yang pertama|yang kedua|yang ketiga|yang keempat)\b/;

const acknowledgementPattern =
  /^(iya|ya|oke|ok|sip|betul|benar|itu|iya itu|ya itu|oke itu|ok itu)$/;

const smallTalkPattern =
  /^(hai|halo|hello|hi|helo|test|testing|tes|coba|ping)(\s+(aimo|eltrack|bot|assistant|asisten))?$/;

const smallTalkPhrasePattern =
  /^(apa kabar|selamat pagi|selamat siang|selamat sore|selamat malam)(\s+.*)?$/;

function hasNumberedList(text: string) {
  return /(?:^|\s)\d+[.)]\s+\S+/.test(text);
}

function isSmallTalk(text: string) {
  return smallTalkPattern.test(text) || smallTalkPhrasePattern.test(text);
}

function previewNeedsTransactionName(activePreview: TransaksiPreviewGroup) {
  return activePreview.items.some(
    (item) =>
      !item.namaTransaksi ||
      item.missingFields.some((field) =>
        normalizeText(field).includes('nama transaksi'),
      ),
  );
}

function looksLikeBareRename(text: string, activePreview: TransaksiPreviewGroup) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    wordCount >= 1 &&
    wordCount <= 4 &&
    !nominalPattern.test(text) &&
    !isSmallTalk(text) &&
    !acknowledgementPattern.test(text) &&
    previewNeedsTransactionName(activePreview)
  );
}

function looksLikeCorrection(text: string, activePreview: TransaksiPreviewGroup) {
  if (hasNumberedList(text)) {
    return true;
  }

  if (correctionPattern.test(text) || acknowledgementPattern.test(text)) {
    return true;
  }

  return looksLikeBareRename(text, activePreview);
}

function looksLikeNewTransaction(text: string, hasImageContent: boolean) {
  if (hasImageContent) {
    return true;
  }

  if (/\b(struk|receipt|foto)\b/.test(text)) {
    return true;
  }

  if (
    createPreviewRequestPattern.test(text) &&
    (transactionDetailPattern.test(text) || nominalPattern.test(text))
  ) {
    return true;
  }

  return transactionDetailPattern.test(text) && nominalPattern.test(text);
}

export function classifyPreviewIntent({
  latestUserMessage,
  activePreview,
  hasImageContent,
}: {
  latestUserMessage: string | null;
  activePreview: TransaksiPreviewGroup | null;
  hasImageContent: boolean;
}): PreviewIntent {
  const normalizedText = normalizeText(latestUserMessage ?? '');

  if (!normalizedText) {
    return hasImageContent ? 'new-preview' : 'chat';
  }

  if (isSmallTalk(normalizedText)) {
    return 'chat';
  }

  const isNewTransaction = looksLikeNewTransaction(
    normalizedText,
    hasImageContent,
  );

  if (!activePreview) {
    return isNewTransaction ? 'new-preview' : 'chat';
  }

  if (isNewTransaction && !looksLikeCorrection(normalizedText, activePreview)) {
    return 'new-preview';
  }

  if (looksLikeCorrection(normalizedText, activePreview)) {
    return 'update-preview';
  }

  return isNewTransaction ? 'new-preview' : 'chat';
}
