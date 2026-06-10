import { describe, it, expect, vi } from 'vitest';
import { transferAntarKantongService } from './services/transfer.service.server';
import { getKantongPageDataService } from '#/features/kantong/services/kantong.service.server';
import { runWithOptionalTransaction } from '#/db/mongoose.server';

vi.mock('#/features/kantong/services/kantong.service.server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#/features/kantong/services/kantong.service.server')>();
  return {
    ...actual,
    getKantongPageDataService: vi.fn(),
  };
});

describe('Transfer Race Condition Oracle', () => {
  it('should fail if concurrent transfers bypass the balance validation', async () => {
    // Both concurrent requests will fetch the balance at the same time BEFORE the transaction.
    vi.mocked(getKantongPageDataService).mockResolvedValue({
      items: [
        { _id: 'source-1', currentBalance: 100, bucket: 'cash', nama: 'Dompet' },
        { _id: 'dest-1', currentBalance: 0, bucket: 'cash', nama: 'Tabungan' },
      ],
    } as any);

    // If both pass the balance check, they will both enter the transaction to insert.
    // In MongoDB, inserting new documents concurrently does not cause a write conflict.
    // Thus both will succeed, leaving the balance at -100.
    
    // We launch them concurrently.
    const t1 = transferAntarKantongService('user-1', {
      sourceKantongId: 'source-1',
      destKantongId: 'dest-1',
      nominal: 100,
      tanggal: '2026-06-09',
      waktu: 'Siang',
    });
    
    const t2 = transferAntarKantongService('user-1', {
      sourceKantongId: 'source-1',
      destKantongId: 'dest-1',
      nominal: 100,
      tanggal: '2026-06-09',
      waktu: '12:01',
    });

    const results = await Promise.allSettled([t1, t2]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    
    // An oracle would assert that at most ONE transfer succeeds to prevent negative balance.
    // Because of the bug, BOTH will fulfill, violating the invariant.
    expect(fulfilled.length).toBeLessThanOrEqual(1);
  });
});
