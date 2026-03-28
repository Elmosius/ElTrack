import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '#/lib/auth.server';
import { createTransaksiSchema, deleteTransaksiSchema, updateTransaksiSchema } from './transaksi.schema';
import { createTransaksi, deleteTransaksi, listTransaksi, updateTransaksi } from './transaksi.server';

export const getListTransaksi = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return listTransaksi(session.user.id);
});

export const postTransaksi = createServerFn({ method: 'POST' })
  .inputValidator(createTransaksiSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return createTransaksi(session.user.id, data);
  });

export const patchTransaksi = createServerFn({ method: 'POST' })
  .inputValidator(updateTransaksiSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return updateTransaksi(session.user.id, data);
  });

export const deleteTransaksiById = createServerFn({ method: 'POST' })
  .inputValidator(deleteTransaksiSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return deleteTransaksi(session.user.id, data);
  });
