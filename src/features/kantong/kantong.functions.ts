import { requireSessionUserId } from '#/lib/auth/session';
import { createServerFn } from '@tanstack/react-start';
import {
  archiveKantong,
  createKantong,
  getKantongPageData,
  listActiveKantong,
  setupDefaultKantongs,
  unarchiveKantong,
} from './kantong.server';
import {
  archiveKantongSchema,
  createKantongSchema,
  setupDefaultKantongSchema,
} from './kantong.schema';

export const getKantongData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return getKantongPageData(userId);
  },
);

export const getListKantong = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requireSessionUserId();
    return listActiveKantong(userId);
  },
);

export const postKantong = createServerFn({ method: 'POST' })
  .inputValidator(createKantongSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return createKantong(userId, data);
  });

export const saveDefaultKantongSetup = createServerFn({ method: 'POST' })
  .inputValidator(setupDefaultKantongSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return setupDefaultKantongs(userId, data);
  });

export const archiveKantongById = createServerFn({ method: 'POST' })
  .inputValidator(archiveKantongSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return archiveKantong(userId, data);
  });

export const unarchiveKantongById = createServerFn({ method: 'POST' })
  .inputValidator(archiveKantongSchema)
  .handler(async ({ data }) => {
    const userId = await requireSessionUserId();
    return unarchiveKantong(userId, data);
  });
