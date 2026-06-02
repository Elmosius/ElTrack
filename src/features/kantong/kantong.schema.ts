import { z } from 'zod';
import { objectIdSchema } from '#/lib/object-id';

export const kantongBucketSchema = z.enum(['cash', 'non_cash']);

export const createKantongSchema = z.object({
  nama: z.string().trim().min(1, 'Nama kantong wajib diisi'),
  bucket: kantongBucketSchema,
  openingBalance: z.number().nonnegative('Saldo awal tidak boleh negatif'),
});

export const setupDefaultKantongSchema = z.object({
  openingCash: z.number().nonnegative('Saldo cash tidak boleh negatif'),
  openingNonCash: z.number().nonnegative('Saldo non-cash tidak boleh negatif'),
});

export const archiveKantongSchema = z.object({
  id: objectIdSchema,
});

export type CreateKantongInput = z.infer<typeof createKantongSchema>;
export type SetupDefaultKantongInput = z.infer<
  typeof setupDefaultKantongSchema
>;
export type ArchiveKantongInput = z.infer<typeof archiveKantongSchema>;
