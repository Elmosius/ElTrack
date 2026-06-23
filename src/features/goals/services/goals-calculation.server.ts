import type {
  GoalProgress,
  GoalSummary,
  GoalViewItem,
  SerializedSavingGoal,
} from '#/types/goals';
import type { KantongSummaryItem } from '#/types/kantong';

function toDateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function calculateGoalProgress({
  currentAmount,
  targetAmount,
  deadline,
  now = new Date(),
}: {
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
  now?: Date;
}): GoalProgress {
  const safeTarget = Math.max(1, targetAmount);
  const safeCurrent = Math.max(0, currentAmount);
  const remainingAmount = Math.max(0, safeTarget - safeCurrent);
  const progressPercent = Math.min(100, (safeCurrent / safeTarget) * 100);
  const isComplete = remainingAmount === 0;

  if (!deadline || isComplete) {
    return {
      currentAmount: safeCurrent,
      remainingAmount,
      progressPercent,
      isComplete,
      monthsRemaining: deadline ? 0 : null,
      idealMonthlyContribution: null,
    };
  }

  const today = toDateOnly(now);
  const deadlineDate = parseDateOnly(deadline);

  if (deadlineDate < today) {
    return {
      currentAmount: safeCurrent,
      remainingAmount,
      progressPercent,
      isComplete,
      monthsRemaining: 0,
      idealMonthlyContribution: remainingAmount,
    };
  }

  const monthsRemaining =
    (deadlineDate.getFullYear() - today.getFullYear()) * 12 +
    (deadlineDate.getMonth() - today.getMonth()) +
    1;

  return {
    currentAmount: safeCurrent,
    remainingAmount,
    progressPercent,
    isComplete,
    monthsRemaining,
    idealMonthlyContribution: Math.ceil(remainingAmount / monthsRemaining),
  };
}

export function buildGoalViewItems({
  goals,
  kantongs,
  now,
}: {
  goals: SerializedSavingGoal[];
  kantongs: KantongSummaryItem[];
  now?: Date;
}): GoalViewItem[] {
  const kantongMap = new Map(kantongs.map((item) => [item._id, item]));

  return goals.map((goal) => {
    const kantongDetail = kantongMap.get(goal.kantong) ?? null;
    const progress = calculateGoalProgress({
      currentAmount: kantongDetail?.currentBalance ?? 0,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline,
      now,
    });

    return {
      ...goal,
      ...progress,
      kantongDetail,
    };
  });
}

export function buildGoalSummary(goals: GoalViewItem[]): GoalSummary {
  return goals.reduce<GoalSummary>(
    (summary, goal) => ({
      totalTarget: summary.totalTarget + goal.targetAmount,
      totalCurrent: summary.totalCurrent + goal.currentAmount,
      totalRemaining: summary.totalRemaining + goal.remainingAmount,
      activeGoalCount: summary.activeGoalCount + (goal.isComplete ? 0 : 1),
    }),
    {
      totalTarget: 0,
      totalCurrent: 0,
      totalRemaining: 0,
      activeGoalCount: 0,
    },
  );
}
