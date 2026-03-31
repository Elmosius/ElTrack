import type { UIMessage } from '@tanstack/ai-react';
import { waktuOptionsStatic } from '#/lib/transaction-table';
import { z } from 'zod';

export const chatbotPreviewEventName = 'transaksi-preview-ready';

export const tipeNameSchema = z.enum(['Pengeluaran', 'Penghasilan']);
export const waktuNameSchema = z.enum(waktuOptionsStatic);

export const previewTransaksiToolInputSchema = z.object({
  namaTransaksi: z.string().trim().nullable().optional(),
  tanggal: z.string().trim().nullable().optional(),
  nominal: z.union([z.number(), z.string()]).nullable().optional(),
  waktu: waktuNameSchema.nullable().optional(),
  kategoriName: z.string().trim().nullable().optional(),
  metodePembayaranName: z.string().trim().nullable().optional(),
  tipeName: tipeNameSchema.nullable().optional(),
  catatan: z.string().trim().nullable().optional(),
  confidenceNotes: z.array(z.string().trim()).optional(),
});

export const transaksiPreviewSchema = z.object({
  namaTransaksi: z.string().trim().nullable(),
  tanggal: z.string().trim().nullable(),
  nominal: z.number().nullable(),
  waktu: waktuNameSchema.nullable(),
  kategoriName: z.string().trim().nullable(),
  kategoriId: z.string().trim().nullable(),
  metodePembayaranName: z.string().trim().nullable(),
  metodePembayaranId: z.string().trim().nullable(),
  tipeName: tipeNameSchema.nullable(),
  tipeId: z.string().trim().nullable(),
  catatan: z.string().trim().nullable(),
  confidenceNotes: z.array(z.string().trim()),
  missingFields: z.array(z.string().trim()),
  canConfirm: z.boolean(),
});

const chatMessagePartSchema = z.object({
  type: z.string().trim().min(1),
}).catchall(z.unknown());

const assistantChatMessageSchema = z.object({
  id: z.string().trim().min(1),
  role: z.literal('assistant'),
  parts: z.array(chatMessagePartSchema),
});

export const chatSessionInputSchema = z.object({
  chatSessionId: z.string().trim().min(1),
});

export const confirmTransaksiPreviewSchema = chatSessionInputSchema;
export const dismissTransaksiPreviewSchema = chatSessionInputSchema;
export const persistAssistantChatMessageSchema = chatSessionInputSchema.extend({
  message: assistantChatMessageSchema,
});

export type PreviewTransaksiToolInput = z.infer<typeof previewTransaksiToolInputSchema>;
export type TransaksiPreview = z.infer<typeof transaksiPreviewSchema>;
export type ConfirmTransaksiPreviewInput = z.infer<typeof confirmTransaksiPreviewSchema>;
export type DismissTransaksiPreviewInput = z.infer<typeof dismissTransaksiPreviewSchema>;
export type PersistAssistantChatMessageInput = z.infer<typeof persistAssistantChatMessageSchema>;

export type ChatSessionSummary = {
  id: string;
  title: string;
  status: 'active';
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string | null;
  lastOpenedAt?: string | null;
};

export type ChatSessionDetail = {
  session: ChatSessionSummary;
  messages: UIMessage[];
  pendingPreview: TransaksiPreview | null;
};

export type ConfirmChatbotPreviewResult = {
  assistantMessage: UIMessage;
  session: ChatSessionSummary;
};
