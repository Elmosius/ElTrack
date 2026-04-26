import type { TransaksiPreviewGroup } from '#/types/chatbot';
import {
  extractRenameTransactionNamesFromUserMessage,
  resolveSingleTransactionNameCandidate,
} from './chatbot-preview-name-parsers.server';

export function resolveFallbackTransactionName(
  latestUserMessage: string | null | undefined,
  activePreview: TransaksiPreviewGroup | null,
  itemCount: number,
) {
  if (!latestUserMessage || itemCount !== 1) {
    return null;
  }

  if (activePreview?.items.length && activePreview.items.length > 1) {
    return null;
  }

  return resolveSingleTransactionNameCandidate(
    latestUserMessage,
    Boolean(activePreview),
  );
}

export function buildRenameFallbackNames(
  latestUserMessage: string | null | undefined,
  activePreview: TransaksiPreviewGroup | null,
  itemCount: number,
) {
  if (!latestUserMessage || !activePreview || itemCount <= 1) {
    return [];
  }

  const renameNames =
    extractRenameTransactionNamesFromUserMessage(latestUserMessage);

  if (renameNames.length === 0) {
    return [];
  }

  const fallbackNames = Array.from<string | null>({ length: itemCount }).fill(
    null,
  );

  for (const item of renameNames) {
    if (item.index >= itemCount) {
      continue;
    }

    fallbackNames[item.index] = item.name;
  }

  return fallbackNames;
}
