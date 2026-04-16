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
  transaksiPreviewGroupSchema,
  type TransaksiPreviewGroup,
} from '../chatbot.schema';
import { extractPreviewSummary } from '../mappers';
import {
  getGeminiTextModel,
  getGeminiVisionModel,
  getPendingPreview,
  type ChatbotMasterData,
} from '../chatbot.shared.server';
import { getChatbotMasterData } from './chatbot-master-data.service.server';
import { buildResolvedPreview } from './chatbot-preview.service.server';
import {
  getChatSessionOrThrow,
  updateChatSessionPendingPreviewService,
} from './chatbot-session.service.server';

const previewTransaksiTool = toolDefinition({
  name: 'preview_transaksi',
  description:
    'Siapkan preview transaksi sebelum disimpan ke tabel. Gunakan tool ini saat user mengirim foto struk, meminta dibuatkan transaksi dari teks, atau memberi koreksi pada preview aktif. Bisa memuat satu atau beberapa transaksi sekaligus. Isi field dengan hasil ekstraksi terbaikmu dan pakai label kategori/metode/tipe yang paling cocok dari daftar yang tersedia.',
  inputSchema: previewTransaksiToolInputSchema,
  outputSchema: transaksiPreviewGroupSchema,
});

function buildSystemPrompt(
  masterData: ChatbotMasterData,
  activePreview: TransaksiPreviewGroup | null,
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
    'Jika user mengirim foto struk, menyebut detail transaksi, meminta dibuatkan transaksi, atau mengoreksi detail transaksi yang sedang dipreview, kamu WAJIB memanggil tool preview_transaksi tepat satu kali sebelum memberi jawaban akhir.',
    'Tool preview_transaksi SELALU harus memakai bentuk { items: [...] }.',
    'Jika user menyebut beberapa transaksi sekaligus, tool preview_transaksi harus berisi semua transaksi tersebut dalam satu preview group.',
    'Setiap item di dalam items harus berisi field yang memang sudah kamu ketahui. Jangan pernah mengirim item kosong.',
    'Jika baru tahu sebagian detail, tetap isi field yang sudah diketahui dan biarkan sisanya null.',
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
    activePreview
      ? 'Jika user berkata seperti "iya itu", "oke", "sip", atau memberi koreksi singkat, anggap itu sebagai pembahasan preview aktif dan PERBARUI preview; jangan anggap sebagai instruksi simpan otomatis.'
      : null,
    activePreview
      ? 'Saat memperbarui preview aktif, jangan menghapus detail yang sudah benar. Jika koreksi user hanya tentang tanggal atau field bersama lainnya, perbarui item preview yang ada tanpa membuat item kosong baru.'
      : null,
    'Aplikasi hanya menyimpan transaksi ke tabel setelah user menekan tombol konfirmasi di UI. Kamu tidak boleh mengatakan transaksi sudah berhasil disimpan, ditambahkan ke tabel, atau selesai disimpan kecuali sistem benar-benar memberi tahu hal itu.',
    'Setelah tool berhasil dipanggil, berikan jawaban singkat dan ramah yang menjelaskan apakah preview sudah siap ditinjau, sudah diperbarui, atau masih ada field yang perlu dicek.',
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

function hasImageContent(messages: Array<UIMessage | ModelMessage>) {
  return messages.some((message) => {
    const content =
      'parts' in message && Array.isArray(message.parts)
        ? message.parts
        : 'content' in message && Array.isArray(message.content)
          ? message.content
          : [];

    return content.some(
      (part) =>
        typeof part === 'object' &&
        part !== null &&
        'type' in part &&
        part.type === 'image',
    );
  });
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
  const model = hasImageContent(messages)
    ? getGeminiVisionModel()
    : getGeminiTextModel();

  return chat({
    adapter: geminiText(model),
    messages: withSystemPrompt(
      messages,
      buildSystemPrompt(masterData, activePreview),
    ) as never,
    tools: [
      previewTransaksiTool.server(async (args, context) => {
        const normalizedArgs = previewTransaksiToolInputSchema.parse(args);
        const preview = buildResolvedPreview(normalizedArgs, masterData);
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
