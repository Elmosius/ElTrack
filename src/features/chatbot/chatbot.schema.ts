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

export const confirmTransaksiPreviewSchema = transaksiPreviewSchema;

export type PreviewTransaksiToolInput = z.infer<typeof previewTransaksiToolInputSchema>;
export type TransaksiPreview = z.infer<typeof transaksiPreviewSchema>;
export type ConfirmTransaksiPreviewInput = z.infer<typeof confirmTransaksiPreviewSchema>;
