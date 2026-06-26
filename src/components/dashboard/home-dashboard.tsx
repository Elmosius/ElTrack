import type { DashboardHomeData } from '#/types/dashboard';
import type { DashboardTrendMode } from '#/lib/dashboard';
import { useState } from 'react';
import { DashboardBalanceSection } from './dashboard-balance-section';
import { DashboardDistributionCharts } from './dashboard-distribution-charts';
import { DashboardHeader } from './dashboard-header';
import { DashboardOverviewCards } from './dashboard-overview-cards';
import { DashboardRecentTransactions } from './dashboard-recent-transactions';
import { DashboardTopCategories } from './dashboard-top-categories';
import { DashboardTrendCard } from './dashboard-trend-card';
import { LanggananReminderSection } from '../langganan/langganan-reminder-section';

type HomeDashboardProps = {
  data: DashboardHomeData;
  onMonthChange: (month: string) => void;
};

export function HomeDashboard({ data, onMonthChange }: HomeDashboardProps) {
  const [trendMode, setTrendMode] = useState<DashboardTrendMode>('weekly');

  return (
    <div className='flex flex-col gap-4'>
      <DashboardHeader
        selectedMonth={data.selectedMonth}
        onMonthChange={onMonthChange}
      />

      <DashboardBalanceSection balance={data.balance} />

      <DashboardOverviewCards overview={data.overview} />

      <LanggananReminderSection reminders={data.langgananReminders} compact />

      <DashboardTrendCard
        mode={trendMode}
        onModeChange={setTrendMode}
        trend={data.trend}
      />

      <DashboardDistributionCharts
        categoryDistribution={data.categoryDistribution}
        paymentMethodDistribution={data.paymentMethodDistribution}
      />

      <div className='grid gap-4 xl:grid-cols-[1.05fr_0.95fr]'>
        <DashboardRecentTransactions transactions={data.recentTransactions} />
        <DashboardTopCategories
          categories={data.topCategories}
          isEmpty={data.isEmpty}
        />
      </div>
    </div>
  );
}
