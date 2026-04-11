const busyChatbotMessage = 'Model AI sedang sibuk, coba lagi beberapa saat.';
const genericChatbotMessage = 'Terjadi kesalahan pada chatbot. Coba lagi.';

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Coba lagi.';
}

function getErrorSourceText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return '';
  }
}

export function getChatbotErrorMessage(error: unknown) {
  const errorSourceText = getErrorSourceText(error).toLowerCase();

  if (
    errorSourceText.includes('503') ||
    errorSourceText.includes('429') ||
    errorSourceText.includes('unavailable') ||
    errorSourceText.includes('high demand') ||
    errorSourceText.includes('rate limit') ||
    errorSourceText.includes('resource exhausted') ||
    errorSourceText.includes('too many requests')
  ) {
    return busyChatbotMessage;
  }

  return genericChatbotMessage;
}
