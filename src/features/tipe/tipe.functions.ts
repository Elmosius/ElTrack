import { createServerFn } from '@tanstack/react-start';
import { listTipe } from './tipe.server';

export const getListTipe = createServerFn({ method: 'GET' }).handler(async () => {
  return listTipe();
});
