import { describe, expect, it } from 'vitest';
import {
  buildLanggananSummary,
  buildLanggananViewItems,
  calculateNextDueDate,
  calculateReminderStatus,
  getLanggananReminderMilestone,
} from './langganan-calculation.server';

const baseLangganan = {
  _id: 'langganan-1',
  userId: 'user-1',
  nama: 'Netflix',
  nominal: 75_000,
  frequency: 'bulanan' as const,
  nextDueDate: '2026-06-29',
  reminderDays: 3,
  kantong: 'kantong-1',
  status: 'aktif' as const,
};

describe('langganan calculation', () => {
  it('marks active subscriptions as due soon within reminder window', () => {
    const result = calculateReminderStatus({
      status: 'aktif',
      nextDueDate: '2026-06-28',
      reminderDays: 3,
      now: new Date('2026-06-25T08:00:00.000Z'),
    });

    expect(result).toBe('due-soon');
  });

  it('keeps quiet between milestone reminder days', () => {
    const result = calculateReminderStatus({
      status: 'aktif',
      nextDueDate: '2026-06-28',
      reminderDays: 3,
      now: new Date('2026-06-26T08:00:00.000Z'),
    });

    expect(result).toBe('safe');
  });

  it('marks H-1 and due date as due soon', () => {
    expect(
      calculateReminderStatus({
        status: 'aktif',
        nextDueDate: '2026-06-28',
        reminderDays: 3,
        now: new Date('2026-06-27T08:00:00.000Z'),
      }),
    ).toBe('due-soon');
    expect(
      calculateReminderStatus({
        status: 'aktif',
        nextDueDate: '2026-06-28',
        reminderDays: 3,
        now: new Date('2026-06-28T08:00:00.000Z'),
      }),
    ).toBe('due-soon');
  });

  it('returns reminder milestones without duplicate H-N values', () => {
    expect(
      getLanggananReminderMilestone({
        status: 'aktif',
        nextDueDate: '2026-06-28',
        reminderDays: 3,
        now: new Date('2026-06-25T08:00:00.000Z'),
      }),
    ).toBe('h-n');
    expect(
      getLanggananReminderMilestone({
        status: 'aktif',
        nextDueDate: '2026-06-28',
        reminderDays: 3,
        now: new Date('2026-06-26T08:00:00.000Z'),
      }),
    ).toBeNull();
    expect(
      getLanggananReminderMilestone({
        status: 'aktif',
        nextDueDate: '2026-06-28',
        reminderDays: 1,
        now: new Date('2026-06-27T08:00:00.000Z'),
      }),
    ).toBe('h-1');
    expect(
      getLanggananReminderMilestone({
        status: 'aktif',
        nextDueDate: '2026-06-28',
        reminderDays: 0,
        now: new Date('2026-06-28T08:00:00.000Z'),
      }),
    ).toBe('due');
    expect(
      getLanggananReminderMilestone({
        status: 'aktif',
        nextDueDate: '2026-06-20',
        reminderDays: 3,
        now: new Date('2026-06-28T08:00:00.000Z'),
      }),
    ).toBe('overdue');
    expect(
      getLanggananReminderMilestone({
        status: 'dijeda',
        nextDueDate: '2026-06-20',
        reminderDays: 3,
        now: new Date('2026-06-28T08:00:00.000Z'),
      }),
    ).toBeNull();
  });

  it('marks active subscriptions as overdue after due date', () => {
    const result = calculateReminderStatus({
      status: 'aktif',
      nextDueDate: '2026-06-20',
      reminderDays: 3,
      now: new Date('2026-06-25T08:00:00.000Z'),
    });

    expect(result).toBe('overdue');
  });

  it('keeps paused subscriptions out of active reminder status', () => {
    const result = calculateReminderStatus({
      status: 'dijeda',
      nextDueDate: '2026-06-20',
      reminderDays: 3,
      now: new Date('2026-06-26T08:00:00.000Z'),
    });

    expect(result).toBe('paused');
  });

  it('calculates monthly and annual estimates while excluding paused summary items', () => {
    const items = buildLanggananViewItems({
      now: new Date('2026-06-26T08:00:00.000Z'),
      items: [
        baseLangganan,
        {
          ...baseLangganan,
          _id: 'langganan-2',
          nama: 'Domain',
          nominal: 240_000,
          frequency: 'tahunan',
          nextDueDate: '2026-07-20',
        },
        {
          ...baseLangganan,
          _id: 'langganan-3',
          nama: 'Paused',
          status: 'dijeda',
        },
      ],
      kantongs: [
        {
          _id: 'kantong-1',
          userId: 'user-1',
          nama: 'Bank',
          bucket: 'cash',
          openingBalance: 0,
          activatedAt: '2026-06-01T00:00:00.000Z',
          currentBalance: 500_000,
          income: 500_000,
          expenses: 0,
          isArchived: false,
        },
      ],
    });

    expect(items[0]?.monthlyEstimate).toBe(75_000);
    expect(items[1]?.monthlyEstimate).toBe(20_000);
    expect(buildLanggananSummary(items)).toEqual({
      monthlyEstimate: 95_000,
      annualEstimate: 1_140_000,
      dueSoonCount: 1,
      overdueCount: 0,
    });
  });

  it('calculates next due date for monthly and annual schedules with month-end clamp', () => {
    expect(calculateNextDueDate('2026-01-31', 'bulanan')).toBe('2026-02-28');
    expect(calculateNextDueDate('2024-02-29', 'tahunan')).toBe('2025-02-28');
  });
});
