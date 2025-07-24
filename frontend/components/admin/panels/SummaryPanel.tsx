// frontend/components/admin/panels/SummaryPanel.tsx
import { MetricCard } from './MetricCard';
import { PlanDistribution } from './PlanDistributionPanel';
import { SummarySection } from './SummarySection';
import { useTranslation } from "next-i18next";

interface DashboardData {
  new_users: number;
  active_users: number;
  churned_users: number;
  estimated_revenue: number;
  plan_distribution: {
    free: number;
    pro: number;
    business: number;
    enterprise: number;
  };
}

interface SummaryPanelProps {
  data: DashboardData;
}

export const SummaryPanel = ({ data }: SummaryPanelProps) => {
  const { t } = useTranslation("common");
  const totalUsers = Object.values(data.plan_distribution).reduce(
    (sum, count) => sum + count, 0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t("new_users")} 
          value={data.new_users} 
          description={t("last_30_days")} 
        />
        
        <MetricCard 
          title={t("active_users")} 
          value={data.active_users} 
          description={t("with_recent_activity")} 
          color="bg-blue-50"
        />
        
        <MetricCard 
          title={t("churned_users")} 
          value={data.churned_users} 
          description={t("last_60_days")} 
          color="bg-red-50"
        />
        
        <MetricCard 
          title={t("estimated_revenue")} 
          value={`$${data.estimated_revenue.toLocaleString()}`} 
          description={t("monthly")} 
          color="bg-green-50"
        />
      </div>

      <PlanDistribution data={data.plan_distribution} />
      <SummarySection 
        totalUsers={totalUsers} 
        churnedUsers={data.churned_users} 
        estimatedRevenue={data.estimated_revenue} 
      />
    </div>
  );
};