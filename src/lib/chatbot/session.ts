import { defaultChatSessionTitleLabel } from '@/const/chatbot';

export function createChatSessionTitle(rawText: string | null | undefined) {
  const normalized = rawText?.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return defaultChatSessionTitleLabel;
  }

  return normalized.length > 48
    ? `${normalized.slice(0, 45).trimEnd()}...`
    : normalized;
}
