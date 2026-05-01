import { describe, expect, it } from 'vitest';
import { isObjectId, objectIdSchema } from './object-id';

describe('object id validation', () => {
  it('accepts 24-character hex ObjectIds', () => {
    expect(isObjectId('507f1f77bcf86cd799439011')).toBe(true);
    expect(objectIdSchema.safeParse('507f1f77bcf86cd799439011').success).toBe(true);
  });

  it('rejects non-ObjectId strings', () => {
    expect(isObjectId('not-an-id')).toBe(false);
    expect(objectIdSchema.safeParse('not-an-id').success).toBe(false);
  });
});
