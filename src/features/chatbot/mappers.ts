import type { UIMessage } from '@tanstack/ai-react';
import { serializeDate, stringifyId } from '#/lib/serialization';
import type {
  ChatSessionSummary,
  TransaksiPreviewGroup,
  TransaksiPreviewItem,
} from './chatbot.schema';

export type StoredChatMessage = {
  _id?: unknown;
  messageId: string;
  role: UIMessage['role'];
  parts: UIMessage['parts'];
  createdAt?: Date | string;
};

export function serializeChatSession(item: {
  _id: unknown;
  title: string;
  status?: 'active';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastMessageAt?: Date | string | null;
  lastOpenedAt?: Date | string | null;
}): ChatSessionSummary {
  return {
    id: stringifyId(item._id),
    title: item.title,
    status: item.status ?? 'active',
    createdAt: serializeDate(item.createdAt) ?? undefined,
    updatedAt: serializeDate(item.updatedAt) ?? undefined,
    lastMessageAt: serializeDate(item.lastMessageAt),
    lastOpenedAt: serializeDate(item.lastOpenedAt),
  };
}

export function serializeChatMessage(item: StoredChatMessage): UIMessage {
  return {
    id: item.messageId || stringifyId(item._id),
    role: item.role,
    parts: Array.isArray(item.parts) ? item.parts : [],
  };
}

function extractPreviewItemSummary(preview: TransaksiPreviewItem, index: number) {
  const lines = [
    `Transaksi ${index + 1}: ${preview.namaTransaksi ?? '-'}`,
    `Tanggal: ${preview.tanggal ?? '-'}`,
    `Waktu: ${preview.waktu ?? '-'}`,
    `Nominal: ${preview.nominal != null ? String(preview.nominal) : '-'}`,
    `Kategori: ${preview.kategoriName ?? '-'}`,
    `Metode pembayaran: ${preview.metodePembayaranName ?? '-'}`,
    `Tipe: ${preview.tipeName ?? '-'}`,
    `Catatan: ${preview.catatan ?? '-'}`,
  ];

  if (preview.missingFields.length > 0) {
    lines.push(
      `Field yang masih perlu dicek: ${preview.missingFields.join(' | ')}`,
    );
  }

  return lines.join('\n');
}

export function extractPreviewSummary(preview: TransaksiPreviewGroup) {
  const sections = preview.items.map((item, index) =>
    extractPreviewItemSummary(item, index),
  );

  if (preview.missingFields.length > 0) {
    sections.push(
      `Ringkasan field yang masih perlu dicek: ${preview.missingFields.join(
        ' || ',
      )}`,
    );
  }

  return sections.join('\n\n');
}
