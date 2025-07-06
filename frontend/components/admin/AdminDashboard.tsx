// components/admin/AdminDashboard.tsx
// components/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import Spinner from '../Spinner';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface PlanDistribution {
  free: number;
  pro: number;
  business: number;
  enterprise: number;
}

interface DashboardData {
  new_users: number;
  active_users: number;
  churned_users: number;
  estimated_revenue: number;
  plan_distribution: PlanDistribution;
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

const MetricCard = ({ 
  title, 
  value, 
  description, 
  color = "bg-white"
}: {
  title: string;
  value: number | string;
  description?: string;
  color?: string;
}) => (
  <div className={`${color} rounded-xl shadow-md p-6 transition-all hover:shadow-lg`}>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    {description && (
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    )}
  </div>
);

const CollapsiblePanel = ({ 
  title, 
  children,
  defaultOpen = true 
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="p-6 pt-0">{children}</div>}
    </div>
  );
};

const PlanDistribution = ({ data }: { data: PlanDistribution }) => {
  const totalUsers = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700">Distribución de Planes</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(data).map(([plan, count]) => (
          <div key={plan} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h4 className="text-md font-medium capitalize text-gray-700">{plan}</h4>
            <p className="text-2xl font-bold text-indigo-600">{count}</p>
            <p className="text-sm text-gray-500">
              {totalUsers > 0 ? `${Math.round((count / totalUsers) * 100)}% del total` : '0%'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SummarySection = ({ 
  totalUsers, 
  churnedUsers, 
  estimatedRevenue 
}: {
  totalUsers: number;
  churnedUsers: number;
  estimatedRevenue: number;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-700">Resumen General</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <h4 className="text-md font-medium text-gray-700">Total Usuarios</h4>
        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <h4 className="text-md font-medium text-gray-700">Tasa de Retención</h4>
        <p className="text-2xl font-bold text-gray-900">
          {totalUsers > 0 
            ? `${Math.round(((totalUsers - churnedUsers) / totalUsers) * 100)}%` 
            : '0%'}
        </p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <h4 className="text-md font-medium text-gray-700">Valor por Usuario</h4>
        <p className="text-2xl font-bold text-gray-900">
          {totalUsers > 0 
            ? `$${(estimatedRevenue / totalUsers).toFixed(2)}` 
            : '$0.00'}
        </p>
      </div>
    </div>
  </div>
);

const FirewallAnalysis = ({ stats }: { stats: FirewallStats }) => {
  const outcomes = [
    { name: 'Permitidos', value: stats.allow, color: 'bg-green-100 text-green-800' },
    { name: 'Bloqueados', value: stats.block, color: 'bg-red-100 text-red-800' },
    { name: 'Limitados', value: stats.limit, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Rate Limit', value: stats.ratelimit, color: 'bg-orange-100 text-orange-800' },
    { name: 'Redirecciones', value: stats.redirect, color: 'bg-blue-100 text-blue-800' },
    { name: 'Marcados', value: stats.flagged, color: 'bg-purple-100 text-purple-800' },
    { name: 'Otros', value: stats.other, color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Eventos" 
          value={stats.total} 
          description="Todos los eventos registrados" 
        />
        
        <MetricCard 
          title="Tasa de Bloqueo" 
          value={`${stats.total > 0 ? Math.round((stats.block / stats.total) * 100) : 0}%`} 
          description="Porcentaje de bloqueos" 
          color="bg-red-50"
        />
        
        <MetricCard 
          title="Tasa de Limitación" 
          value={`${stats.total > 0 ? Math.round((stats.limit / stats.total) * 100) : 0}%`} 
          description="Porcentaje de limitaciones" 
          color="bg-yellow-50"
        />
        
        <MetricCard 
          title="Tasa de Redirección" 
          value={`${stats.total > 0 ? Math.round((stats.redirect / stats.total) * 100) : 0}%`} 
          description="Porcentaje de redirecciones" 
          color="bg-blue-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Distribución de Eventos</h3>
        <div className="space-y-3">
          {outcomes.map((outcome) => (
            <div key={outcome.name} className="flex items-center">
              <div className="w-32 text-sm font-medium text-gray-500">{outcome.name}</div>
              <div className="flex-1">
                <div className="h-8 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className={`h-full rounded-full ${outcome.color}`}
                    style={{ width: `${stats.total > 0 ? (outcome.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium">
                {outcome.value} ({stats.total > 0 ? Math.round((outcome.value / stats.total) * 100) : 0}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserActivityPanel = ({ topUsers }: { topUsers: TopUser[] }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Usuarios Activos" 
          value={topUsers.length} 
          description="Usuarios con más actividad" 
          color="bg-blue-50"
        />
        
        <MetricCard 
          title="Solicitudes Totales" 
          value={topUsers.reduce((sum, user) => sum + user.request_count, 0)} 
          description="De los usuarios más activos" 
        />
        
        <MetricCard 
          title="Usuario Top" 
          value={topUsers[0]?.name || 'N/A'} 
          description={`${topUsers[0]?.request_count || 0} solicitudes`} 
          color="bg-green-50"
        />
        
        <MetricCard 
          title="Plan más usado" 
          value={(() => {
            const planCounts: Record<string, number> = {};
            topUsers.forEach(user => {
              planCounts[user.plan] = (planCounts[user.plan] || 0) + 1;
            });
            return Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
          })()} 
          description="Entre usuarios activos" 
          color="bg-purple-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Top Usuarios por Actividad</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitudes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      user.plan === 'business' ? 'bg-blue-100 text-blue-800' :
                      user.plan === 'pro' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.request_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.last_activity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BotActivityPanel = ({ botActivities }: { botActivities: BotActivity[] }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Agentes Detectados" 
          value={botActivities.length} 
          description="Agentes de bots identificados" 
          color="bg-orange-50"
        />
        
        <MetricCard 
          title="Solicitudes Totales" 
          value={botActivities.reduce((sum, bot) => sum + bot.request_count, 0)} 
          description="De todos los bots" 
        />
        
        <MetricCard 
          title="Bot más Activo" 
          value={botActivities[0]?.user_agent.split('/')[0] || 'N/A'} 
          description={`${botActivities[0]?.request_count || 0} solicitudes`} 
          color="bg-red-50"
        />
        
        <MetricCard 
          title="Tasa de Bloqueo" 
          value={`${botActivities.reduce((sum, bot) => sum + bot.block_rate, 0) / botActivities.length || 0}%`} 
          description="Promedio de bloqueos" 
          color="bg-yellow-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Actividad de Bots</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitudes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa de Bloqueo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {botActivities.map((bot, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{bot.user_agent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bot.request_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-red-600 h-2.5 rounded-full" 
                          style={{ width: `${bot.block_rate}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{bot.block_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bot.last_seen).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [firewallStats, setFirewallStats] = useState<FirewallStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [botActivities, setBotActivities] = useState<BotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data
        const dashboard = await apiFetch<DashboardData>('/rest/admin/overview');
        setDashboardData(dashboard);
        
        // Fetch GLOBAL firewall stats (sin tenant_id específico)
        const stats = await apiFetch<FirewallStats>('/rest/logs/stats');
        setFirewallStats(stats);
        
        // Fetch top users
        const users = await apiFetch<TopUser[]>('/rest/admin/top-users');
        setTopUsers(users);
        
        // Fetch bot activities
        const bots = await apiFetch<BotActivity[]>('/rest/admin/bot-activities');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!dashboardData || !firewallStats) return null;

  const totalUsers = Object.values(dashboardData.plan_distribution).reduce(
    (sum, count) => sum + count, 0
  );

  return (
    <div className="space-y-6">
      {/* Panel de Resumen */}
      <CollapsiblePanel title="Resumen General" defaultOpen={true}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Nuevos Usuarios" 
              value={dashboardData.new_users} 
              description="Últimos 30 días" 
            />
            
            <MetricCard 
              title="Usuarios Activos" 
              value={dashboardData.active_users} 
              description="Con actividad reciente" 
              color="bg-blue-50"
            />
            
            <MetricCard 
              title="Bajas" 
              value={dashboardData.churned_users} 
              description="Últimos 60 días" 
              color="bg-red-50"
            />
            
            <MetricCard 
              title="Ingresos Estimados" 
              value={`$${dashboardData.estimated_revenue.toLocaleString()}`} 
              description="Mensual" 
              color="bg-green-50"
            />
          </div>

          <PlanDistribution data={dashboardData.plan_distribution} />
          <SummarySection 
            totalUsers={totalUsers} 
            churnedUsers={dashboardData.churned_users} 
            estimatedRevenue={dashboardData.estimated_revenue} 
          />
        </div>
      </CollapsiblePanel>

      {/* Panel de Análisis de Firewall */}
      <CollapsiblePanel title="Análisis de Firewall">
        <FirewallAnalysis stats={firewallStats} />
      </CollapsiblePanel>

      {/* Panel de Actividad de Usuarios */}
      <CollapsiblePanel title="Actividad de Usuarios">
        <UserActivityPanel topUsers={topUsers} />
      </CollapsiblePanel>

      {/* Panel de Actividad de Bots */}
      <CollapsiblePanel title="Actividad de Bots">
        <BotActivityPanel botActivities={botActivities} />
      </CollapsiblePanel>
    </div>
  );
}