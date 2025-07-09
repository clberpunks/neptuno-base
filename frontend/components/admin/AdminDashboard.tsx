import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import Spinner from '../shared/Spinner';
import { CollapsiblePanel } from './panels/CollapsiblePanel';
import { SummaryPanel } from './panels/SummaryPanel';
import { FirewallPanel } from './panels/FirewallPanel';
import { UserActivityPanel } from './panels/UserActivityPanel';
import { BotActivityPanel } from './panels/BotActivityPanel';

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

interface FirewallStats {
  total: number;
  allow: number;
  block: number;
  limit: number;
  ratelimit: number;
  redirect: number;
  flagged: number;
  other: number;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  request_count: number;
  last_activity: string;
  plan: string;
}

interface BotActivity {
  user_agent: string;
  request_count: number;
  last_seen: string;
  block_rate: number;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [firewallStats, setFirewallStats] = useState<FirewallStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [botActivities, setBotActivities] = useState<BotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = process.env.BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const dashboard = await apiFetch<DashboardData>(`/rest/admin/overview`);
        setDashboardData(dashboard);
        
        const stats = await apiFetch<FirewallStats>(`/rest/logs/stats`);
        setFirewallStats(stats);
        
        const users = await apiFetch<TopUser[]>(`/rest/admin/top-users`);
        setTopUsers(users);
        
        const bots = await apiFetch<BotActivity[]>(`/rest/admin/bot-activities`);
        setBotActivities(bots);
        
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  if (error) return (
    <div className="p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  if (!dashboardData || !firewallStats) return null;

  return (
    <div className="space-y-6">
      <CollapsiblePanel title="Resumen General" defaultOpen={true}>
        <SummaryPanel data={dashboardData} />
      </CollapsiblePanel>

      <CollapsiblePanel title="Análisis de Firewall">
        <FirewallPanel stats={firewallStats} />
      </CollapsiblePanel>

      <CollapsiblePanel title="Actividad de Usuarios">
        <UserActivityPanel topUsers={topUsers} />
      </CollapsiblePanel>

      <CollapsiblePanel title="Actividad de Bots">
        <BotActivityPanel botActivities={botActivities} />
      </CollapsiblePanel>
    </div>
  );
}