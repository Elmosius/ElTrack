import { createServerFn } from '@tanstack/react-start';
import { listWaktu } from './waktu.server';

export const getListWaktu = createServerFn({ method: 'GET' }).handler(async () => {
  return listWaktu();
});
