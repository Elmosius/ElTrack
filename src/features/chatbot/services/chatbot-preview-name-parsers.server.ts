import { cleanText } from '../chatbot.shared.server';
import {
  looksLikeTransactionDetailMessage,
  normalizePreviewMessage,
  renameLeadingNoiseWords,
  sanitizeTransactionNameCandidate,
  stripLeadingTokens,
  stripNoiseWords,
} from './chatbot-preview-name-utils.server';

export function extractIndexedTransactionNamesFromUserMessage(
  value: string | null | undefined,
) {
  const normalized = normalizePreviewMessage(value ?? '');

  if (!normalized) {
    return [];
  }

  const matches = Array.from(
    normalized.matchAll(
      /(?:^|\s)(\d+)\s+([a-z][a-z0-9\s-]*?)(?=\s+\d+\s+|$)/g,
    ),
  );

  if (matches.length < 2) {
    return [];
  }

  return matches
    .map((match) => {
      const index = Number(match[1]) - 1;
      const candidate = sanitizeTransactionNameCandidate(match[2], {
        maxWords: 4,
      });

      if (!candidate || !Number.isInteger(index) || index < 0) {
        return null;
      }

      return {
        index,
        name: candidate,
      };
    })
    .filter((item): item is { index: number; name: string } => Boolean(item))
    .sort((left, right) => left.index - right.index);
}

export function extractSequentialTransactionNamesFromUserMessage(
  value: string | null | undefined,
) {
  const normalized = normalizePreviewMessage(value ?? '');

  if (!normalized || !/\bnama transaksi(?:nya)?\b/.test(normalized)) {
    return [];
  }

  const payload = normalized
    .replace(/^.*?\bnama transaksi(?:nya)?\b/, '')
    .replace(/^(?:ini|nya)?\s*(?:aja|saja)?\s*:?/, '')
    .trim();

  if (!payload) {
    return [];
  }

  const lines = payload
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  return lines
    .map((line, index) => {
      const cleanedLine = line.replace(/^\d+\s+/, '');
      const candidate = sanitizeTransactionNameCandidate(cleanedLine, {
        maxWords: 4,
      });

      if (!candidate) {
        return null;
      }

      return {
        index,
        name: candidate,
      };
    })
    .filter((item): item is { index: number; name: string } => Boolean(item));
}

export function extractRenameTransactionNamesFromUserMessage(
  value: string | null | undefined,
) {
  const indexedNames = extractIndexedTransactionNamesFromUserMessage(value);

  if (indexedNames.length > 0) {
    return indexedNames;
  }

  return extractSequentialTransactionNamesFromUserMessage(value);
}

export function extractInitialTransactionNameFromUserMessage(
  value: string | null | undefined,
) {
  const normalized = normalizePreviewMessage(value ?? '');

  if (!normalized) {
    return null;
  }

  const compactValue = normalized
    .replace(/\bnama transaksi(?:nya)?\b/g, ' ')
    .replace(/\btransaksi(?:nya)?\b/g, ' ')
    .replace(/\bsekarang\b/g, ' ')
    .replace(/\bjadi\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const stopMatch = compactValue.search(
    /\d|\b(?:rp|idr|rb|ribu|juta|cash|tunai|qris|debit|kredit|transfer|siang|pagi|sore|malam|tanggal|jam|pukul|pakai|pake|dengan)\b/,
  );
  const truncatedValue =
    stopMatch > 0 ? compactValue.slice(0, stopMatch).trim() : compactValue;

  return sanitizeTransactionNameCandidate(truncatedValue);
}

export function extractRenameTransactionNameFromUserMessage(
  value: string | null | undefined,
) {
  const normalized = normalizePreviewMessage(value ?? '');

  if (!normalized) {
    return null;
  }

  const explicitPatterns = [
    /\b(?:nama transaksi(?:nya)?|transaksi(?:nya)?)\s+(?:menjadi|jadi)\s+(.+)$/,
    /\b(?:ubah|ganti|gnti|perbarui|update|rename)\s+(?:nama transaksi(?:nya)?|transaksi(?:nya)?)\s+(?:menjadi|jadi)?\s*(.+)$/,
    /\b(?:hanya|cuma)\s+(.+)$/,
  ];

  for (const pattern of explicitPatterns) {
    const match = normalized.match(pattern);

    if (!match) {
      continue;
    }

    const candidate = sanitizeTransactionNameCandidate(match[1], {
      maxWords: 4,
    });

    if (candidate) {
      return candidate;
    }
  }

  const rawTokens = normalized.split(' ').filter(Boolean);
  const strippedLeadingTokens = stripLeadingTokens(
    rawTokens,
    renameLeadingNoiseWords,
  );
  const strippedTokens = stripNoiseWords(strippedLeadingTokens);

  if (strippedTokens.length === 0 || strippedTokens.length > 4) {
    return null;
  }

  if (
    strippedTokens.some(
      (token) =>
        renameLeadingNoiseWords.has(token) ||
        token === 'bukan' ||
        token === 'mksdnya' ||
        token === 'maksudnya',
    )
  ) {
    return null;
  }

  return cleanText(strippedTokens.join(' '));
}

export function resolveSingleTransactionNameCandidate(
  latestUserMessage: string | null | undefined,
  hasActivePreview: boolean,
) {
  if (!latestUserMessage) {
    return null;
  }

  if (!hasActivePreview) {
    return extractInitialTransactionNameFromUserMessage(latestUserMessage);
  }

  const renameCandidate =
    extractRenameTransactionNameFromUserMessage(latestUserMessage);

  if (renameCandidate) {
    return renameCandidate;
  }

  if (looksLikeTransactionDetailMessage(latestUserMessage)) {
    return extractInitialTransactionNameFromUserMessage(latestUserMessage);
  }

  return null;
}
