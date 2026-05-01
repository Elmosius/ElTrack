import { z } from 'zod';
import { objectIdSchema } from '#/lib/object-id';

export const createTransaksiSchema = z.object({
  namaTransaksi: z.string().trim().min(1, 'Nama transaksi wajib diisi'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal transaksi tidak valid'),
  waktu: z.string().min(1, 'Waktu wajib dipilih'),
  nominal: z.number().nonnegative('Nominal tidak boleh negatif'),
  kategori: objectIdSchema,
  metodePembayaran: objectIdSchema,
  catatan: z.string().trim().optional(),
  tipe: objectIdSchema,
});

export type CreateTransaksiInput = z.infer<typeof createTransaksiSchema>;

export const updateTransaksiSchema = createTransaksiSchema.extend({
  id: objectIdSchema,
});

export const deleteTransaksiSchema = z.object({
  id: objectIdSchema,
});

export type UpdateTransaksiInput = z.infer<typeof updateTransaksiSchema>;
export type DeleteTransaksiInput = z.infer<typeof deleteTransaksiSchema>;
