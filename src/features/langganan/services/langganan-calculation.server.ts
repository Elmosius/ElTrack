import type {
  LanggananReminderMilestone,
  LanggananReminderItem,
  LanggananReminderStatus,
  LanggananSummary,
  LanggananViewItem,
  SerializedLangganan,
} from '#/types/langganan';
import type { KantongSummaryItem } from '#/types/kantong';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateString(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function toDateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseLanggananDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function getLastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonthsClamped(value: string, amount: number) {
  const date = parseLanggananDate(value);
  const targetMonthIndex = date.getMonth() + amount;
  const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12);
  const normalizedTargetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const day = Math.min(
    date.getDate(),
    getLastDayOfMonth(targetYear, normalizedTargetMonth),
  );

  return toDateString(new Date(targetYear, normalizedTargetMonth, day));
}

export function calculateNextDueDate(
  currentDueDate: string,
  frequency: SerializedLangganan['frequency'],
) {
  return addMonthsClamped(currentDueDate, frequency === 'bulanan' ? 1 : 12);
}

export function calculateDaysUntilDue({
  nextDueDate,
  now = new Date(),
}: {
  nextDueDate: string;
  now?: Date;
}) {
  const today = toDateOnly(now);
  const dueDate = parseLanggananDate(nextDueDate);
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((dueDate.getTime() - today.getTime()) / msPerDay);
}

export function calculateReminderStatus({
  status,
  nextDueDate,
  reminderDays,
  now,
}: Pick<SerializedLangganan, 'status' | 'nextDueDate' | 'reminderDays'> & {
  now?: Date;
}): LanggananReminderStatus {
  if (status === 'dijeda') {
    return 'paused';
  }

  const daysUntilDue = calculateDaysUntilDue({ nextDueDate, now });

  if (daysUntilDue < 0) {
    return 'overdue';
  }

  if (daysUntilDue === 0 || daysUntilDue === 1 || daysUntilDue === reminderDays) {
    return 'due-soon';
  }

  return 'safe';
}

export function getLanggananReminderMilestone({
  status,
  nextDueDate,
  reminderDays,
  now,
}: Pick<SerializedLangganan, 'status' | 'nextDueDate' | 'reminderDays'> & {
  now?: Date;
}): LanggananReminderMilestone | null {
  if (status === 'dijeda') {
    return null;
  }

  const daysUntilDue = calculateDaysUntilDue({ nextDueDate, now });

  if (daysUntilDue < 0) {
    return 'overdue';
  }

  if (daysUntilDue === 0) {
    return 'due';
  }

  if (daysUntilDue === 1) {
    return 'h-1';
  }

  if (reminderDays > 1 && daysUntilDue === reminderDays) {
    return 'h-n';
  }

  return null;
}

export function buildLanggananViewItems({
  items,
  kantongs,
  now,
}: {
  items: SerializedLangganan[];
  kantongs: KantongSummaryItem[];
  now?: Date;
}): LanggananViewItem[] {
  const kantongMap = new Map(kantongs.map((item) => [item._id, item]));

  return items.map((item) => {
    const daysUntilDue = calculateDaysUntilDue({
      nextDueDate: item.nextDueDate,
      now,
    });
    const monthlyEstimate =
      item.frequency === 'bulanan' ? item.nominal : item.nominal / 12;
    const annualEstimate =
      item.frequency === 'bulanan' ? item.nominal * 12 : item.nominal;

    return {
      ...item,
      kantongDetail: kantongMap.get(item.kantong) ?? null,
      reminderStatus: calculateReminderStatus({
        status: item.status,
        nextDueDate: item.nextDueDate,
        reminderDays: item.reminderDays,
        now,
      }),
      daysUntilDue,
      monthlyEstimate,
      annualEstimate,
    };
  });
}

export function buildLanggananSummary(items: LanggananViewItem[]): LanggananSummary {
  return items.reduce<LanggananSummary>(
    (summary, item) => {
      if (item.status === 'dijeda') {
        return summary;
      }

      return {
        monthlyEstimate: summary.monthlyEstimate + item.monthlyEstimate,
        annualEstimate: summary.annualEstimate + item.annualEstimate,
        dueSoonCount:
          summary.dueSoonCount + (item.reminderStatus === 'due-soon' ? 1 : 0),
        overdueCount:
          summary.overdueCount + (item.reminderStatus === 'overdue' ? 1 : 0),
      };
    },
    {
      monthlyEstimate: 0,
      annualEstimate: 0,
      dueSoonCount: 0,
      overdueCount: 0,
    },
  );
}

export function buildLanggananReminderItems(
  items: LanggananViewItem[],
): LanggananReminderItem[] {
  return items
    .filter((item) => item.reminderStatus === 'due-soon' || item.reminderStatus === 'overdue')
    .map((item) => ({
      _id: item._id,
      nama: item.nama,
      nominal: item.nominal,
      nextDueDate: item.nextDueDate,
      reminderStatus: item.reminderStatus,
      daysUntilDue: item.daysUntilDue,
    }));
}
