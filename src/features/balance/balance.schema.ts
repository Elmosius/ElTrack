import { z } from 'zod';

export const upsertBalanceSettingsSchema = z.object({
  openingCash: z.number().nonnegative('Saldo cash tidak boleh negatif'),
  openingNonCash: z.number().nonnegative('Saldo non-cash tidak boleh negatif'),
});

export type UpsertBalanceSettingsInput = z.infer<
  typeof upsertBalanceSettingsSchema
>;
