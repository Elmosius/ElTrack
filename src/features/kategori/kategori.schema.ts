import { z } from 'zod';
import { objectIdSchema } from '#/lib/object-id';

export const createKategoriSchema = z.object({
  nama: z.string().trim().min(1, 'Nama kategori wajib diisi'),
});

export type CreateKategoriInput = z.infer<typeof createKategoriSchema>;

export const updateKategoriSchema = createKategoriSchema.extend({
  id: objectIdSchema,
});

export const deleteKategoriSchema = z.object({
  id: objectIdSchema,
});

export type UpdateKategoriInput = z.infer<typeof updateKategoriSchema>;
export type DeleteKategoriInput = z.infer<typeof deleteKategoriSchema>;
