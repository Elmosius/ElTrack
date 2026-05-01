import { z } from 'zod';

const objectIdPattern = /^[a-f\d]{24}$/i;

export function isObjectId(value: string) {
  return objectIdPattern.test(value);
}

export const objectIdSchema = z
  .string()
  .trim()
  .refine(isObjectId, 'ObjectId tidak valid');
