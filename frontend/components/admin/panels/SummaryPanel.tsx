import { MetricCard } from './MetricCard';
import { PlanDistribution } from './PlanDistributionPanel';
import { SummarySection } from './SummarySection';

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
  const totalUsers = Object.values(data.plan_distribution).reduce(
    (sum, count) => sum + count, 0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Nuevos Usuarios" 
          value={data.new_users} 
          description="Últimos 30 días" 
        />
        
        <MetricCard 
          title="Usuarios Activos" 
          value={data.active_users} 
          description="Con actividad reciente" 
          color="bg-blue-50"
        />
        
        <MetricCard 
          title="Bajas" 
          value={data.churned_users} 
          description="Últimos 60 días" 
          color="bg-red-50"
        />
        
        <MetricCard 
          title="Ingresos Estimados" 
          value={`$${data.estimated_revenue.toLocaleString()}`} 
          description="Mensual" 
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