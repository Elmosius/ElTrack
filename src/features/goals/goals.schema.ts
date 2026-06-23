import { z } from 'zod';
import { objectIdSchema } from '#/lib/object-id';

const deadlineSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline tidak valid')
  .optional()
  .or(z.literal(''));

const optionalTextSchema = z.string().trim().optional().or(z.literal(''));

export const createSavingGoalSchema = z.object({
  nama: z.string().trim().min(1, 'Nama goal wajib diisi'),
  media: z.string().trim().min(1, 'Media wajib diisi'),
  kantong: objectIdSchema,
  targetAmount: z.number().positive('Target wajib lebih dari 0'),
  deadline: deadlineSchema,
  monthlyContributionTarget: z
    .number()
    .nonnegative('Setoran rutin tidak boleh negatif')
    .optional(),
  catatan: optionalTextSchema,
});

export const updateSavingGoalSchema = createSavingGoalSchema.extend({
  id: objectIdSchema,
});

export const deleteSavingGoalSchema = z.object({
  id: objectIdSchema,
});

export type CreateSavingGoalInput = z.infer<typeof createSavingGoalSchema>;
export type UpdateSavingGoalInput = z.infer<typeof updateSavingGoalSchema>;
export type DeleteSavingGoalInput = z.infer<typeof deleteSavingGoalSchema>;
