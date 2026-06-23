import type { KantongSummaryItem } from './kantong';

export type SerializedSavingGoal = {
  _id: string;
  userId: string;
  nama: string;
  media: string;
  kantong: string;
  targetAmount: number;
  deadline?: string;
  monthlyContributionTarget?: number;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GoalProgress = {
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  isComplete: boolean;
  monthsRemaining: number | null;
  idealMonthlyContribution: number | null;
};

export type GoalSummary = {
  totalTarget: number;
  totalCurrent: number;
  totalRemaining: number;
  activeGoalCount: number;
};

export type GoalViewItem = SerializedSavingGoal &
  GoalProgress & {
    kantongDetail: KantongSummaryItem | null;
  };

export type GoalsPageData = {
  goals: GoalViewItem[];
  summary: GoalSummary;
  kantongs: KantongSummaryItem[];
  mediaSuggestions: string[];
  isKantongConfigured: boolean;
};
