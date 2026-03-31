import type { GeminiTextModel } from '@tanstack/ai-gemini';
import { transaksiPreviewSchema, type PreviewTransaksiToolInput } from './chatbot.schema';

export type NamedOption = {
  id: string;
  name: string;
};

export type ChatbotMasterData = {
  kategori: NamedOption[];
  metodePembayaran: NamedOption[];
  tipe: NamedOption[];
};

export const defaultChatSessionTitle = 'Chat baru';
const defaultGeminiTextModel: GeminiTextModel = 'gemini-2.5-flash-lite';
const defaultGeminiVisionModel: GeminiTextModel = 'gemini-2.5-flash';

export function getGeminiTextModel(): GeminiTextModel {
  return (
    (process.env.GEMINI_TEXT_MODEL as GeminiTextModel) ||
    (process.env.GEMINI_MODEL as GeminiTextModel) ||
    defaultGeminiTextModel
  );
}

export function getGeminiVisionModel(): GeminiTextModel {
  return (
    (process.env.GEMINI_VISION_MODEL as GeminiTextModel) ||
    (process.env.GEMINI_MODEL as GeminiTextModel) ||
    defaultGeminiVisionModel
  );
}

export function normalizeText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' dan ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function cleanText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function parseNominal(value: string | number | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const digits = value.replace(/[^\d]/g, '');

  if (!digits) {
    return null;
  }

  const nominal = Number(digits);
  return Number.isFinite(nominal) ? nominal : null;
}

export function normalizeDate(value: string | null | undefined) {
  const raw = cleanText(value);

  if (!raw) {
    return null;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const localMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (localMatch) {
    const day = localMatch[1].padStart(2, '0');
    const month = localMatch[2].padStart(2, '0');
    const year =
      localMatch[3].length === 2 ? `20${localMatch[3]}` : localMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export function uniq(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => cleanText(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

export function findBestOptionMatch(options: NamedOption[], rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  const normalizedValue = normalizeText(rawValue);

  if (!normalizedValue) {
    return null;
  }

  const exactMatch = options.find(
    (option) => normalizeText(option.name) === normalizedValue,
  );

  if (exactMatch) {
    return exactMatch;
  }

  const looseMatches = options.filter((option) => {
    const normalizedOption = normalizeText(option.name);
    return (
      normalizedOption.includes(normalizedValue) ||
      normalizedValue.includes(normalizedOption)
    );
  });

  return looseMatches.length === 1 ? looseMatches[0] : null;
}

export function getPendingPreview(value: unknown) {
  const parsed = transaksiPreviewSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export type PreviewResolutionInput = PreviewTransaksiToolInput;
