import { toolDefinition, chat, convertMessagesToModelMessages, maxIterations } from '@tanstack/ai';
import type { ModelMessage, UIMessage } from '@tanstack/ai';
import { ollamaText } from '@tanstack/ai-ollama';
import { listKategori } from '#/features/kategori/kategori.server';
import { listMetodePembayaran } from '#/features/metode-pembayaran/metode-pembayaran.server';
import { createTransaksi } from '#/features/transaksi/transaksi.server';
import { listTipe } from '#/features/tipe/tipe.server';
import { chatbotPreviewEventName, previewTransaksiToolInputSchema, transaksiPreviewSchema, type ConfirmTransaksiPreviewInput, type PreviewTransaksiToolInput, type TransaksiPreview } from './chatbot.schema';

type NamedOption = {
  id: string;
  name: string;
};

type ChatbotMasterData = {
  kategori: NamedOption[];
  metodePembayaran: NamedOption[];
  tipe: NamedOption[];
};

const defaultOllamaModel = 'qwen3-vl:235b-cloud';

const previewTransaksiTool = toolDefinition({
  name: 'preview_transaksi',
  description:
    'Siapkan preview transaksi sebelum disimpan ke tabel. Gunakan tool ini saat user mengirim foto struk atau meminta dibuatkan transaksi dari teks. Isi field dengan hasil ekstraksi terbaikmu dan pakai label kategori/metode/tipe yang paling cocok dari daftar yang tersedia.',
  inputSchema: previewTransaksiToolInputSchema,
  outputSchema: transaksiPreviewSchema,
});

function getOllamaModel() {
  return process.env.OLLAMA_MODEL || defaultOllamaModel;
}

function normalizeText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' dan ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseNominal(value: string | number | null | undefined) {
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

function normalizeDate(value: string | null | undefined) {
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
    const year = localMatch[3].length === 2 ? `20${localMatch[3]}` : localMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function uniq(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => cleanText(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function findBestOptionMatch(options: NamedOption[], rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  const normalizedValue = normalizeText(rawValue);

  if (!normalizedValue) {
    return null;
  }

  const exactMatch = options.find((option) => normalizeText(option.name) === normalizedValue);

  if (exactMatch) {
    return exactMatch;
  }

  const looseMatches = options.filter((option) => {
    const normalizedOption = normalizeText(option.name);
    return normalizedOption.includes(normalizedValue) || normalizedValue.includes(normalizedOption);
  });

  return looseMatches.length === 1 ? looseMatches[0] : null;
}

function buildMissingFields(preview: Omit<TransaksiPreview, 'missingFields' | 'canConfirm'>) {
  const missingFields: string[] = [];

  if (!preview.namaTransaksi) {
    missingFields.push('Nama transaksi belum terisi.');
  }

  if (!preview.tanggal) {
    missingFields.push('Tanggal transaksi belum terbaca.');
  }

  if (preview.nominal == null) {
    missingFields.push('Nominal transaksi belum terbaca.');
  }

  if (!preview.waktu) {
    missingFields.push('Waktu transaksi belum ditentukan.');
  }

  if (!preview.kategoriId) {
    missingFields.push('Kategori belum cocok dengan daftar kategori yang tersedia.');
  }

  if (!preview.metodePembayaranId) {
    missingFields.push('Metode pembayaran belum cocok dengan daftar yang tersedia.');
  }

  if (!preview.tipeId) {
    missingFields.push('Tipe transaksi belum cocok dengan daftar yang tersedia.');
  }

  return missingFields;
}

function buildResolvedPreview(args: PreviewTransaksiToolInput, masterData: ChatbotMasterData): TransaksiPreview {
  const kategoriName = cleanText(args.kategoriName);
  const metodePembayaranName = cleanText(args.metodePembayaranName);
  const tipeName = args.tipeName ?? null;

  const matchedKategori = findBestOptionMatch(masterData.kategori, kategoriName);
  const matchedMetodePembayaran = findBestOptionMatch(masterData.metodePembayaran, metodePembayaranName);
  const matchedTipe = findBestOptionMatch(masterData.tipe, tipeName);

  const previewBase = {
    namaTransaksi: cleanText(args.namaTransaksi),
    tanggal: normalizeDate(args.tanggal),
    nominal: parseNominal(args.nominal),
    waktu: args.waktu ?? null,
    kategoriName,
    kategoriId: matchedKategori?.id ?? null,
    metodePembayaranName,
    metodePembayaranId: matchedMetodePembayaran?.id ?? null,
    tipeName,
    tipeId: matchedTipe?.id ?? null,
    catatan: cleanText(args.catatan),
    confidenceNotes: uniq([
      ...(args.confidenceNotes ?? []),
      kategoriName && !matchedKategori ? `Kategori "${kategoriName}" belum cocok dengan daftar kategori yang tersedia.` : null,
      metodePembayaranName && !matchedMetodePembayaran ? `Metode pembayaran "${metodePembayaranName}" belum cocok dengan daftar metode pembayaran yang tersedia.` : null,
      tipeName && !matchedTipe ? `Tipe "${tipeName}" belum cocok dengan daftar tipe yang tersedia.` : null,
    ]),
  } satisfies Omit<TransaksiPreview, 'missingFields' | 'canConfirm'>;

  const missingFields = buildMissingFields(previewBase);

  return transaksiPreviewSchema.parse({
    ...previewBase,
    missingFields,
    canConfirm: missingFields.length === 0,
  });
}

async function getChatbotMasterData(userId: string): Promise<ChatbotMasterData> {
  const [kategori, metodePembayaran, tipe] = await Promise.all([
    listKategori(userId),
    listMetodePembayaran(),
    listTipe(),
  ]);

  return {
    kategori: kategori.map((item) => ({ id: item._id, name: item.nama })),
    metodePembayaran: metodePembayaran.map((item) => ({ id: String(item._id), name: item.nama })),
    tipe: tipe.map((item) => ({ id: String(item._id), name: item.nama })),
  };
}

function buildSystemPrompt(masterData: ChatbotMasterData) {
  const tanggalHariIni = new Date().toISOString().slice(0, 10);
  const kategoriList = masterData.kategori.map((item) => item.name).join(', ') || '-';
  const metodePembayaranList = masterData.metodePembayaran.map((item) => item.name).join(', ') || '-';
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
    'Setelah tool berhasil dipanggil, berikan jawaban singkat dan ramah yang menjelaskan apakah preview sudah siap ditinjau atau masih ada field yang perlu dicek.',
    'Jangan mengarang ID atau membuat kategori/metode baru.',
  ].join('\n');
}

function withSystemPrompt(messages: Array<UIMessage | ModelMessage>, systemPrompt: string) {
  return [
    {
      role: 'system' as const,
      content: systemPrompt,
    },
    ...convertMessagesToModelMessages(messages),
  ] as ModelMessage[];
}

export async function createChatbotStream(userId: string, messages: Array<UIMessage | ModelMessage>) {
  const masterData = await getChatbotMasterData(userId);
  const stream = chat({
    adapter: ollamaText(getOllamaModel()),
    messages: withSystemPrompt(messages, buildSystemPrompt(masterData)) as never,
    tools: [
      previewTransaksiTool.server(async (args, context) => {
        const preview = buildResolvedPreview(args, masterData);
        context?.emitCustomEvent(chatbotPreviewEventName, preview);
        return preview;
      }),
    ],
    agentLoopStrategy: maxIterations(5),
  });

  return stream;
}

export async function confirmChatbotPreview(userId: string, input: ConfirmTransaksiPreviewInput) {
  const preview = transaksiPreviewSchema.parse(input);

  if (!preview.canConfirm) {
    throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
  }

  if (!preview.namaTransaksi || !preview.tanggal || preview.nominal == null || !preview.waktu || !preview.kategoriId || !preview.metodePembayaranId || !preview.tipeId) {
    throw new Error('Preview transaksi belum lengkap, jadi belum bisa disimpan.');
  }

  return createTransaksi(userId, {
    namaTransaksi: preview.namaTransaksi,
    tanggal: preview.tanggal,
    waktu: preview.waktu,
    nominal: preview.nominal,
    kategori: preview.kategoriId,
    metodePembayaran: preview.metodePembayaranId,
    catatan: preview.catatan ?? undefined,
    tipe: preview.tipeId,
  });
}
