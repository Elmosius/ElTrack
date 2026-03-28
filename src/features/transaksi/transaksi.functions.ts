import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '#/lib/auth.server';
import { createTransaksiSchema } from './transaksi.schema';
import { createTransaksi, listTransaksi } from './transaksi.server';

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
