import { z } from 'zod';

export const createKategoriSchema = z.object({
  nama: z.string().trim().min(1, 'Nama kategori wajib diisi'),
});

export type CreateKategoriInput = z.infer<typeof createKategoriSchema>;

export const updateKategoriSchema = createKategoriSchema.extend({
  id: z.string().min(1, 'Id kategori wajib ada'),
});

export const deleteKategoriSchema = z.object({
  id: z.string().min(1, 'Id kategori wajib ada'),
});

export type UpdateKategoriInput = z.infer<typeof updateKategoriSchema>;
export type DeleteKategoriInput = z.infer<typeof deleteKategoriSchema>;
