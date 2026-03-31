import type { ModelMessage, UIMessage } from '@tanstack/ai';
import {
  chat,
  convertMessagesToModelMessages,
  maxIterations,
  toolDefinition,
} from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import {
  chatbotPreviewEventName,
  previewTransaksiToolInputSchema,
  transaksiPreviewSchema,
  type TransaksiPreview,
} from '../chatbot.schema';
import { extractPreviewSummary } from '../mappers';
import { getGeminiModel, getPendingPreview, type ChatbotMasterData } from '../chatbot.shared.server';
import { getChatbotMasterData } from './chatbot-master-data.service.server';
import { buildResolvedPreview } from './chatbot-preview.service.server';
import {
  getChatSessionOrThrow,
  updateChatSessionPendingPreviewService,
} from './chatbot-session.service.server';

const previewTransaksiTool = toolDefinition({
  name: 'preview_transaksi',
  description:
    'Siapkan preview transaksi sebelum disimpan ke tabel. Gunakan tool ini saat user mengirim foto struk atau meminta dibuatkan transaksi dari teks. Isi field dengan hasil ekstraksi terbaikmu dan pakai label kategori/metode/tipe yang paling cocok dari daftar yang tersedia.',
  inputSchema: previewTransaksiToolInputSchema,
  outputSchema: transaksiPreviewSchema,
});

function buildSystemPrompt(
  masterData: ChatbotMasterData,
  activePreview: TransaksiPreview | null,
) {
  const tanggalHariIni = new Date().toISOString().slice(0, 10);
  const kategoriList = masterData.kategori.map((item) => item.name).join(', ') || '-';
  const metodePembayaranList =
    masterData.metodePembayaran.map((item) => item.name).join(', ') || '-';
  const tipeList = masterData.tipe.map((item) => item.name).join(', ') || '-';

  return [
    'Kamu adalah ElTrack Assistant, asisten keuangan pribadi dalam bahasa Indonesia.',
    `Hari ini ${tanggalHariIni}.`,
    'Tugas utamamu adalah membantu chat biasa dan membantu menyiapkan preview transaksi sebelum disimpan.',
    'Jika user mengirim foto struk, menyebut detail transaksi, atau meminta dibuatkan transaksi, kamu WAJIB memanggil tool preview_transaksi tepat satu kali sebelum memberi jawaban akhir.',
    'Jika pertanyaan user bukan tentang membuat transaksi, jawab secara natural tanpa memanggil tool.',
    'Saat memanggil tool, gunakan nilai yang paling sesuai dengan daftar yang tersedia.',
    'Gunakan format tanggal YYYY-MM-DD jika kamu berhasil menebaknya.',
    'Jika tidak yakin, isi null daripada mengarang.',
    `Daftar kategori yang tersedia: ${kategoriList}.`,
    `Daftar metode pembayaran yang tersedia: ${metodePembayaranList}.`,
    `Daftar tipe yang tersedia: ${tipeList}.`,
    'Daftar waktu yang tersedia: Pagi, Siang, Sore, Malam.',
    activePreview
      ? `Saat ini ada preview transaksi aktif yang sedang dibahas user:\n${extractPreviewSummary(activePreview)}`
      : null,
    'Setelah tool berhasil dipanggil, berikan jawaban singkat dan ramah yang menjelaskan apakah preview sudah siap ditinjau atau masih ada field yang perlu dicek.',
    'Jangan mengarang ID atau membuat kategori/metode baru.',
  ]
    .filter(Boolean)
    .join('\n');
}

function withSystemPrompt(
  messages: Array<UIMessage | ModelMessage>,
  systemPrompt: string,
) {
  return [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    ...convertMessagesToModelMessages(messages),
  ] as ModelMessage[];
}

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
  const masterData = await getChatbotMasterData(userId);

  return chat({
    adapter: geminiText(getGeminiModel()),
    messages: withSystemPrompt(
      messages,
      buildSystemPrompt(masterData, activePreview),
    ) as never,
    tools: [
      previewTransaksiTool.server(async (args, context) => {
        const preview = buildResolvedPreview(args, masterData);
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
