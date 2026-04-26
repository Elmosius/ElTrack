import type { ModelMessage, UIMessage } from '@tanstack/ai';
import {
  chat,
  maxIterations,
  toolDefinition,
} from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import {
  chatbotPreviewEventName,
  previewTransaksiToolInputSchema,
  transaksiPreviewGroupSchema,
} from '../chatbot.schema';
import {
  getGeminiTextModel,
  getGeminiVisionModel,
  getPendingPreview,
} from '../chatbot.shared.server';
import { getChatbotMasterData } from './chatbot-master-data.service.server';
import { buildResolvedPreview } from './chatbot-preview.service.server';
import { buildChatbotSystemPrompt } from './chatbot-system-prompt.server';
import {
  getChatSessionOrThrow,
  updateChatSessionPendingPreviewService,
} from './chatbot-session.service.server';
import {
  getLatestUserMessageText,
  hasImageContent,
  withSystemPrompt,
} from './chatbot-stream-utils.server';

const previewTransaksiTool = toolDefinition({
  name: 'preview_transaksi',
  description:
    'Siapkan preview transaksi sebelum disimpan ke tabel. Gunakan tool ini saat user mengirim foto struk, meminta dibuatkan transaksi dari teks, atau memberi koreksi pada preview aktif. Bisa memuat satu atau beberapa transaksi sekaligus. Isi field dengan hasil ekstraksi terbaikmu dan pakai label kategori/metode/tipe yang paling cocok dari daftar yang tersedia.',
  inputSchema: previewTransaksiToolInputSchema,
  outputSchema: transaksiPreviewGroupSchema,
});

export async function createChatbotStreamService({
  userId,
  chatSessionId,
  messages,
}: {
  userId: string;
  chatSessionId: string;
  messages: Array<UIMessage | ModelMessage>;
}) {
  const session = await getChatSessionOrThrow(userId, chatSessionId);
  const activePreview = getPendingPreview(session.pendingPreview);
  const latestUserMessage = getLatestUserMessageText(messages);
  const masterData = await getChatbotMasterData(userId);
  const model = hasImageContent(messages)
    ? getGeminiVisionModel()
    : getGeminiTextModel();

  return chat({
    adapter: geminiText(model),
    messages: withSystemPrompt(
      messages,
      buildChatbotSystemPrompt(masterData, activePreview),
    ) as never,
    tools: [
      previewTransaksiTool.server(async (args, context) => {
        const normalizedArgs = previewTransaksiToolInputSchema.parse(args);
        const preview = buildResolvedPreview(
          normalizedArgs,
          masterData,
          {
            activePreview,
            latestUserMessage,
          },
        );
        await updateChatSessionPendingPreviewService(
          userId,
          chatSessionId,
          preview,
        );
        context?.emitCustomEvent(chatbotPreviewEventName, preview);
        return preview;
      }),
    ],
    agentLoopStrategy: maxIterations(5),
  });
}
