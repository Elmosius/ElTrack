import type { BalanceSummary } from '#/types/balance';
import { DashboardBalanceSetupCard } from './dashboard-balance-setup-card';
import { DashboardBalanceSummaryCards } from './dashboard-balance-summary-cards';

type DashboardBalanceSectionProps = {
  balance: BalanceSummary;
};

export function DashboardBalanceSection({
  balance,
}: DashboardBalanceSectionProps) {
  if (!balance.isConfigured) {
    return <DashboardBalanceSetupCard balance={balance} />;
  }

  return <DashboardBalanceSummaryCards balance={balance} />;
}
