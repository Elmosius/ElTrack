import { z } from 'zod';
import { objectIdSchema } from '#/lib/object-id';

const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tagihan tidak valid');

const optionalTextSchema = z.string().trim().optional().or(z.literal(''));

export const langgananFrequencySchema = z.enum(['bulanan', 'tahunan']);
export const langgananStatusSchema = z.enum(['aktif', 'dijeda']);

export const createLanggananSchema = z.object({
  nama: z.string().trim().min(1, 'Nama langganan wajib diisi'),
  nominal: z.number().positive('Nominal wajib lebih dari 0'),
  frequency: langgananFrequencySchema,
  nextDueDate: dueDateSchema,
  reminderDays: z.number().int().nonnegative('Reminder tidak boleh negatif').default(3),
  kantong: objectIdSchema,
  status: langgananStatusSchema.default('aktif'),
  catatan: optionalTextSchema,
});

export const updateLanggananSchema = createLanggananSchema.extend({
  id: objectIdSchema,
});

export const deleteLanggananSchema = z.object({
  id: objectIdSchema,
});

export const setLanggananStatusSchema = z.object({
  id: objectIdSchema,
  status: langgananStatusSchema,
});

export const payLanggananSchema = z.object({
  id: objectIdSchema,
  tanggal: dueDateSchema.optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().trim().url('Endpoint push tidak valid'),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().trim().min(1, 'Push key p256dh wajib ada'),
    auth: z.string().trim().min(1, 'Push key auth wajib ada'),
  }),
  userAgent: z.string().trim().optional(),
});

export const deletePushSubscriptionSchema = z.object({
  endpoint: z.string().trim().url('Endpoint push tidak valid'),
});

export type CreateLanggananInput = z.infer<typeof createLanggananSchema>;
export type UpdateLanggananInput = z.infer<typeof updateLanggananSchema>;
export type DeleteLanggananInput = z.infer<typeof deleteLanggananSchema>;
export type SetLanggananStatusInput = z.infer<typeof setLanggananStatusSchema>;
export type PayLanggananInput = z.infer<typeof payLanggananSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type DeletePushSubscriptionInput = z.infer<typeof deletePushSubscriptionSchema>;
