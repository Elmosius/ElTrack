import { serializeTipeDoc, type SerializedTipe } from '../mappers';
import { findTipeList } from '../repositories/tipe.repository.server';

export async function listTipeService(): Promise<SerializedTipe[]> {
  const list = await findTipeList();
  return list.map((item) => serializeTipeDoc(item));
}
