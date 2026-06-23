import { describe, expect, it } from 'vitest';
import {
  buildGoalSummary,
  buildGoalViewItems,
  calculateGoalProgress,
} from './goals-calculation.server';

describe('goals calculation', () => {
  it('caps progress at 100% and keeps remaining amount at zero', () => {
    const result = calculateGoalProgress({
      currentAmount: 150_000,
      targetAmount: 100_000,
    });

    expect(result.progressPercent).toBe(100);
    expect(result.remainingAmount).toBe(0);
    expect(result.isComplete).toBe(true);
  });

  it('does not calculate ideal monthly contribution without deadline', () => {
    const result = calculateGoalProgress({
      currentAmount: 25_000,
      targetAmount: 100_000,
    });

    expect(result.remainingAmount).toBe(75_000);
    expect(result.monthsRemaining).toBeNull();
    expect(result.idealMonthlyContribution).toBeNull();
  });

  it('calculates ideal monthly contribution when deadline exists', () => {
    const result = calculateGoalProgress({
      currentAmount: 20_000,
      targetAmount: 100_000,
      deadline: '2026-08-20',
      now: new Date('2026-06-01T00:00:00.000Z'),
    });

    expect(result.monthsRemaining).toBe(3);
    expect(result.idealMonthlyContribution).toBe(26_667);
  });

  it('builds goal view items from linked kantong balances', () => {
    const [goal] = buildGoalViewItems({
      goals: [
        {
          _id: 'goal-1',
          userId: 'user-1',
          nama: 'Reksadana',
          media: 'Reksadana',
          kantong: 'kantong-1',
          targetAmount: 1_000_000,
        },
      ],
      kantongs: [
        {
          _id: 'kantong-1',
          userId: 'user-1',
          nama: 'Bibit',
          bucket: 'non_cash',
          openingBalance: 250_000,
          activatedAt: '2026-06-01T00:00:00.000Z',
          currentBalance: 400_000,
          income: 150_000,
          expenses: 0,
          isArchived: false,
        },
      ],
    });

    expect(goal?.currentAmount).toBe(400_000);
    expect(goal?.remainingAmount).toBe(600_000);
    expect(goal?.kantongDetail?.nama).toBe('Bibit');
  });

  it('summarizes target, current, remaining, and active goals', () => {
    const summary = buildGoalSummary([
      {
        _id: 'goal-1',
        userId: 'user-1',
        nama: 'A',
        media: 'Reksadana',
        kantong: 'kantong-1',
        targetAmount: 100,
        currentAmount: 25,
        remainingAmount: 75,
        progressPercent: 25,
        isComplete: false,
        monthsRemaining: null,
        idealMonthlyContribution: null,
        kantongDetail: null,
      },
      {
        _id: 'goal-2',
        userId: 'user-1',
        nama: 'B',
        media: 'Emas',
        kantong: 'kantong-2',
        targetAmount: 100,
        currentAmount: 100,
        remainingAmount: 0,
        progressPercent: 100,
        isComplete: true,
        monthsRemaining: null,
        idealMonthlyContribution: null,
        kantongDetail: null,
      },
    ]);

    expect(summary).toEqual({
      totalTarget: 200,
      totalCurrent: 125,
      totalRemaining: 75,
      activeGoalCount: 1,
    });
  });
});
