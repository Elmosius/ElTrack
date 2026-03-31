import { requireSessionUserId } from '#/lib/server-auth';
import { createServerFn } from '@tanstack/react-start';
import {
  createKategoriSchema,
  deleteKategoriSchema,
  updateKategoriSchema,
} from './kategori.schema';
import {
  createKategori,
  deleteKategori,
  listKategori,
  updateKategori,
} from './kategori.server';

export const getListKategori = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return listKategori(userId);
  },
);

export const postKategori = createServerFn({ method: 'POST' })
  .inputValidator(createKategoriSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return createKategori(userId, data);
  });

export const patchKategori = createServerFn({ method: 'POST' })
  .inputValidator(updateKategoriSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return updateKategori(userId, data);
  });

export const deleteKategoriById = createServerFn({ method: 'POST' })
  .inputValidator(deleteKategoriSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return deleteKategori(userId, data);
  });
