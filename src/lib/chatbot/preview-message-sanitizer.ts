import type { UIMessage } from '@tanstack/ai-react';
import type { TransaksiPreviewGroup } from '#/types/chatbot';
import { extractMessageText } from './render';

const savedPreviewClaimPattern =
  /(berhasil disimpan|sudah berhasil disimpan|sudah disimpan|ditambahkan ke tabel)/i;
const misleadingPreviewCompletionPattern =
  /(semua detail sudah lengkap|preview(?: transaksi)? sudah lengkap|nama transaks(?:i|inya) sekarang|sudah diperbarui.*(?:lengkap|siap))/i;
const hallucinatedPreviewResponsePattern =
  /```json[\s\S]*"items"\s*:|preview transaksi[^.?!\n]*(?:siap|ditinjau|disimpan)|"namaTransaksi"\s*:|"metodePembayaran"\s*:/i;
const safeChatModeResponse =
  'Aku membaca ini sebagai chat biasa, bukan transaksi. Kalau mau mencatat transaksi, tulis detail transaksinya ya.';

function createAssistantTextMessage(message: UIMessage, content: string) {
  return {
    id: message.id,
    role: 'assistant',
    parts: [
      {
        type: 'text',
        content,
      },
    ],
  } satisfies UIMessage;
}

function normalizePreviewName(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .replace(/["'`”“]/g, ' ')
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractClaimedTransactionName(text: string) {
  const patterns = [
    /nama transaks(?:i|inya) sekarang\s+"([^"]+)"/i,
    /nama transaks(?:i|inya) sekarang\s+“([^”]+)”/i,
    /nama transaks(?:i|inya) sekarang\s+([a-z0-9\s-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const candidate = normalizePreviewName(match[1]);

    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function extractClaimedTransactionNames(text: string) {
  const normalized = normalizePreviewName(text);
  const matches = Array.from(
    normalized.matchAll(/(?:^|\s)(\d+)\s+([a-z][a-z0-9\s-]*?)(?=\s+\d+\s+|$)/g),
  );

  if (matches.length < 2) {
    return [];
  }

  return matches
    .map((match) => {
      const index = Number(match[1]) - 1;
      const name = normalizePreviewName(match[2]);

      if (!Number.isInteger(index) || index < 0 || !name) {
        return null;
      }

      return { index, name };
    })
    .filter((item): item is { index: number; name: string } => Boolean(item))
    .sort((left, right) => left.index - right.index);
}

export function sanitizeAssistantPreviewResponseMessage(
  message: UIMessage,
  preview: TransaksiPreviewGroup | null,
) {
  const text = extractMessageText(message);

  if (message.role !== 'assistant' || !text) {
    return message;
  }

  if (!preview) {
    return hallucinatedPreviewResponsePattern.test(text)
      ? createAssistantTextMessage(message, safeChatModeResponse)
      : message;
  }

  const claimedTransactionName = extractClaimedTransactionName(text);
  const actualTransactionName =
    preview.items.length === 1
      ? normalizePreviewName(preview.items[0]?.namaTransaksi)
      : null;
  const claimedTransactionNames = extractClaimedTransactionNames(text);

  if (
    claimedTransactionName &&
    actualTransactionName &&
    claimedTransactionName !== actualTransactionName
  ) {
    return createAssistantTextMessage(
      message,
      'Preview transaksi sudah diperbarui. Cek lagi nama transaksinya sebelum disimpan ke tabel.',
    );
  }

  if (preview.items.length > 1 && claimedTransactionNames.length > 0) {
    const hasMismatch = claimedTransactionNames.some(({ index, name }) => {
      const previewItem = preview.items[index];

      if (!previewItem) {
        return true;
      }

      return normalizePreviewName(previewItem.namaTransaksi) !== name;
    });

    if (hasMismatch) {
      return createAssistantTextMessage(
        message,
        'Preview transaksi sudah diperbarui. Cek lagi nama transaksi tiap item sebelum disimpan ke tabel.',
      );
    }
  }

  if (!preview.canConfirm && misleadingPreviewCompletionPattern.test(text)) {
    return createAssistantTextMessage(
      message,
      'Preview transaksi sudah diperbarui, tapi masih ada field yang perlu dicek sebelum disimpan ke tabel.',
    );
  }

  if (!savedPreviewClaimPattern.test(text)) {
    return message;
  }

  return createAssistantTextMessage(
    message,
    'Preview transaksi sudah diperbarui. Cek dulu sebelum disimpan ke tabel.',
  );
}
