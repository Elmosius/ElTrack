import { z } from 'zod';

export const createTransaksiSchema = z.object({
  namaTransaksi: z.string().trim().min(1, 'Nama transaksi wajib diisi'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal transaksi tidak valid'),
  waktu: z.string().min(1, 'Waktu wajib dipilih'),
  nominal: z.number().nonnegative('Nominal tidak boleh negatif'),
  kategori: z.string().min(1, 'Kategori wajib dipilih'),
  metodePembayaran: z.string().min(1, 'Metode pembayaran wajib dipilih'),
  catatan: z.string().trim().optional(),
  tipe: z.string().min(1, 'Tipe wajib dipilih'),
});

export type CreateTransaksiInput = z.infer<typeof createTransaksiSchema>;

export const updateTransaksiSchema = createTransaksiSchema.extend({
  id: z.string().min(1, 'Id transaksi wajib ada'),
});

export const deleteTransaksiSchema = z.object({
  id: z.string().min(1, 'Id transaksi wajib ada'),
});

export type UpdateTransaksiInput = z.infer<typeof updateTransaksiSchema>;
export type DeleteTransaksiInput = z.infer<typeof deleteTransaksiSchema>;
