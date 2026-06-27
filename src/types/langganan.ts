import type { KantongSummaryItem } from './kantong';

export type LanggananFrequency = 'bulanan' | 'tahunan';
export type LanggananStatus = 'aktif' | 'dijeda';
export type LanggananReminderStatus = 'paused' | 'overdue' | 'due-soon' | 'safe';
export type LanggananReminderMilestone = 'h-n' | 'h-1' | 'due' | 'overdue';

export type LanggananPushStatus =
  | 'unsupported'
  | 'denied'
  | 'active'
  | 'inactive';

export type LanggananPushState = {
  status: LanggananPushStatus;
  vapidPublicKey: string | null;
  activeSubscriptionCount: number;
};

export type SerializedLangganan = {
  _id: string;
  userId: string;
  nama: string;
  nominal: number;
  frequency: LanggananFrequency;
  nextDueDate: string;
  reminderDays: number;
  kantong: string;
  status: LanggananStatus;
  catatan?: string;
  lastPaidAt?: string;
  lastTransactionId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LanggananViewItem = SerializedLangganan & {
  kantongDetail: KantongSummaryItem | null;
  reminderStatus: LanggananReminderStatus;
  daysUntilDue: number;
  monthlyEstimate: number;
  annualEstimate: number;
};

export type LanggananSummary = {
  monthlyEstimate: number;
  annualEstimate: number;
  dueSoonCount: number;
  overdueCount: number;
};

export type LanggananReminderItem = Pick<
  LanggananViewItem,
  '_id' | 'nama' | 'nominal' | 'nextDueDate' | 'reminderStatus' | 'daysUntilDue'
>;

export type LanggananPageData = {
  items: LanggananViewItem[];
  reminders: LanggananReminderItem[];
  summary: LanggananSummary;
  kantongs: KantongSummaryItem[];
  isKantongConfigured: boolean;
  push: LanggananPushState;
};
