import { requireSessionUserId } from '#/lib/server-auth';
import { createServerFn } from '@tanstack/react-start';
import {
  createTransaksiSchema,
  deleteTransaksiSchema,
  updateTransaksiSchema,
} from './transaksi.schema';
import {
  createTransaksi,
  deleteTransaksi,
  listTransaksi,
  updateTransaksi,
} from './transaksi.server';

export const getListTransaksi = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return listTransaksi(userId);
  },
);

export const postTransaksi = createServerFn({ method: 'POST' })
  .inputValidator(createTransaksiSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return createTransaksi(userId, data);
  });

export const patchTransaksi = createServerFn({ method: 'POST' })
  .inputValidator(updateTransaksiSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return updateTransaksi(userId, data);
  });

export const deleteTransaksiById = createServerFn({ method: 'POST' })
  .inputValidator(deleteTransaksiSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return deleteTransaksi(userId, data);
  });
