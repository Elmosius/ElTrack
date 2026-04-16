import { waktuOptionsStatic } from '#/lib/transaction-table';
import type {
  ChatSessionDetail,
  ChatSessionSummary,
  ConfirmChatbotPreviewResult,
  TransaksiPreviewGroup,
  TransaksiPreviewItem,
} from '#/types/chatbot';
import { z } from 'zod';

export const chatbotPreviewEventName = 'transaksi-preview-ready';

export const tipeNameSchema = z.enum(['Pengeluaran', 'Penghasilan']);
export const waktuNameSchema = z.enum(waktuOptionsStatic);

function hasMeaningfulPreviewField(
  value: Partial<{
    namaTransaksi: string | null;
    tanggal: string | null;
    nominal: string | number | null;
    waktu: string | null;
    kategoriName: string | null;
    metodePembayaranName: string | null;
    tipeName: string | null;
    catatan: string | null;
  }>,
) {
  return Boolean(
    value.namaTransaksi?.trim() ||
      value.tanggal?.trim() ||
      value.nominal != null ||
      value.waktu ||
      value.kategoriName?.trim() ||
      value.metodePembayaranName?.trim() ||
      value.tipeName ||
      value.catatan?.trim(),
  );
}

export const previewTransaksiToolItemInputSchema = z
  .object({
    namaTransaksi: z.string().trim().nullable().optional(),
    tanggal: z.string().trim().nullable().optional(),
    nominal: z.union([z.number(), z.string()]).nullable().optional(),
    waktu: waktuNameSchema.nullable().optional(),
    kategoriName: z.string().trim().nullable().optional(),
    metodePembayaranName: z.string().trim().nullable().optional(),
    tipeName: tipeNameSchema.nullable().optional(),
    catatan: z.string().trim().nullable().optional(),
    confidenceNotes: z.array(z.string().trim()).optional(),
  })
  .superRefine((value, context) => {
    if (hasMeaningfulPreviewField(value)) {
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Setiap item preview harus memiliki minimal satu field transaksi yang terisi.',
    });
  });

export const previewTransaksiToolInputSchema = z.object({
  items: z.array(previewTransaksiToolItemInputSchema).min(1),
  confidenceNotes: z.array(z.string().trim()).optional(),
});

export const transaksiPreviewItemSchema = z.object({
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

export const transaksiPreviewGroupSchema = z.object({
  items: z.array(transaksiPreviewItemSchema).min(1),
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
export type ConfirmTransaksiPreviewInput = z.infer<typeof confirmTransaksiPreviewSchema>;
export type DismissTransaksiPreviewInput = z.infer<typeof dismissTransaksiPreviewSchema>;
export type PersistAssistantChatMessageInput = z.infer<typeof persistAssistantChatMessageSchema>;
export type {
  ChatSessionDetail,
  ChatSessionSummary,
  ConfirmChatbotPreviewResult,
  TransaksiPreviewGroup,
  TransaksiPreviewItem,
};

export function isMeaningfulPreviewItem(
  item:
    | PreviewTransaksiToolInput['items'][number]
    | TransaksiPreviewItem,
) {
  return hasMeaningfulPreviewField(item);
}
