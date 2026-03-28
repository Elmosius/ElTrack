import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '#/lib/auth.server';
import { createKategoriSchema, deleteKategoriSchema, updateKategoriSchema } from './kategori.schema';
import { createKategori, deleteKategori, listKategori, updateKategori } from './kategori.server';

export const getListKategori = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return listKategori(session.user.id);
});

export const postKategori = createServerFn({ method: 'POST' })
  .inputValidator(createKategoriSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return createKategori(session.user.id, data);
  });

export const patchKategori = createServerFn({ method: 'POST' })
  .inputValidator(updateKategoriSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return updateKategori(session.user.id, data);
  });

export const deleteKategoriById = createServerFn({ method: 'POST' })
  .inputValidator(deleteKategoriSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return deleteKategori(session.user.id, data);
  });
