import { serializeMetodePembayaranDoc, type SerializedMetodePembayaran } from '../mappers';
import { findMetodePembayaranList } from '../repositories/metode-pembayaran.repository.server';

export async function listMetodePembayaranService(): Promise<
  SerializedMetodePembayaran[]
> {
  const list = await findMetodePembayaranList();
  return list.map((item) => serializeMetodePembayaranDoc(item));
}
