import { createServerFn } from '@tanstack/react-start';
import { listMetodePembayaran } from './metode-pembayaran.server';

export const getListMetodePembayaran = createServerFn({ method: 'GET' }).handler(async () => {
  return listMetodePembayaran();
});
