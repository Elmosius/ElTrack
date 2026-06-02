import { normalizeText } from '#/features/chatbot/chatbot.shared.server';
import type { SerializedKantong } from '#/types/kantong';
import type { SetupDefaultKantongInput } from '../kantong.schema';
import { serializeKantongDoc } from '../mappers';

type PopulatedNamedRef = {
  _id?: unknown;
  nama?: string;
};

export function getNamedRefName(value: unknown) {
  if (!value || typeof value === 'string') {
    return '';
  }

  return (value as PopulatedNamedRef).nama ?? '';
}

export function getNamedRefId(value: unknown) {
  if (!value || typeof value === 'string') {
    return typeof value === 'string' ? value : '';
  }

  return String((value as PopulatedNamedRef)._id ?? '');
}

export function isDuplicateKantongError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

export function serializeKantongList(
  items: Parameters<typeof serializeKantongDoc>[0][],
) {
  return items.map((item) => serializeKantongDoc(item));
}

export function getEarliestActivationDate(kantongs: SerializedKantong[]) {
  const timestamps = kantongs
    .map((kantong) => new Date(kantong.activatedAt).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return new Date();
  }

  return new Date(Math.min(...timestamps));
}

export function createDefaultKantongInputs({
  openingCash,
  openingNonCash,
}: SetupDefaultKantongInput) {
  return [
    {
      nama: 'Tunai',
      normalizedName: normalizeText('Tunai'),
      bucket: 'cash' as const,
      openingBalance: openingCash,
    },
    {
      nama: 'Non-cash',
      normalizedName: normalizeText('Non-cash'),
      bucket: 'non_cash' as const,
      openingBalance: openingNonCash,
    },
  ];
}
