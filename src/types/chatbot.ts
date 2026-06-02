import type { UIMessage } from '@tanstack/ai-react';

export type TipeName = 'Pengeluaran' | 'Penghasilan';
export type WaktuName = 'Pagi' | 'Siang' | 'Sore' | 'Malam';

export type TransaksiPreviewItem = {
  namaTransaksi: string | null;
  tanggal: string | null;
  nominal: number | null;
  waktu: WaktuName | null;
  kategoriName: string | null;
  kategoriId: string | null;
  metodePembayaranName: string | null;
  metodePembayaranId: string | null;
  tipeName: TipeName | null;
  tipeId: string | null;
  catatan: string | null;
  confidenceNotes: string[];
  missingFields: string[];
  canConfirm: boolean;
};

export type TransaksiPreviewGroup = {
  items: TransaksiPreviewItem[];
  confidenceNotes: string[];
  missingFields: string[];
  canConfirm: boolean;
};

export type TransaksiPreviewItemPatch = Partial<{
  namaTransaksi: string | null;
  tanggal: string | null;
  nominal: string | number | null;
  waktu: WaktuName | null;
  kategoriId: string | null;
  metodePembayaranId: string | null;
  tipeId: string | null;
  catatan: string | null;
}>;

export type ChatbotPreviewOption = {
  id: string;
  name: string;
};

export type ChatbotPreviewEditOptions = {
  waktu: ChatbotPreviewOption[];
  kategori: ChatbotPreviewOption[];
  kantong: ChatbotPreviewOption[];
  tipe: ChatbotPreviewOption[];
};

export type ChatSessionSummary = {
  id: string;
  title: string;
  status: 'active';
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string | null;
  lastOpenedAt?: string | null;
};

export type ChatSessionDetail = {
  session: ChatSessionSummary;
  messages: UIMessage[];
  pendingPreview: TransaksiPreviewGroup | null;
};

export type ConfirmChatbotPreviewResult = {
  assistantMessage: UIMessage;
  session: ChatSessionSummary;
};
