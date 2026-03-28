import { createServerFn } from '@tanstack/react-start';
import { listKategori } from './kategori.server';

export const getListKategori = createServerFn({ method: 'GET' }).handler(async () => {
  return listKategori();
});
