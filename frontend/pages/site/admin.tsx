// pages/admin.tsx
// pages/admin.tsx
import { useEffect, useState } from 'react';
import { withAuth } from '../../utils/withAuth';
import { apiFetch } from '../../utils/api';
import Spinner from '../../components/Spinner';

// Definición de tipos
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

// Componente de tarjeta de métrica
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

// Componente de distribución de planes
const PlanDistribution = ({ data }: { data: PlanDistribution }) => {
  const totalUsers = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribución de Planes</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(data).map(([plan, count]) => (
          <div key={plan} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-lg font-medium capitalize text-gray-700">{plan}</h3>
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

// Componente de resumen general
const SummarySection = ({ 
  totalUsers, 
  churnedUsers, 
  estimatedRevenue 
}: {
  totalUsers: number;
  churnedUsers: number;
  estimatedRevenue: number;
}) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen General</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-medium text-gray-700">Total Usuarios</h3>
        <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-medium text-gray-700">Tasa de Retención</h3>
        <p className="text-3xl font-bold text-gray-900">
          {totalUsers > 0 
            ? `${Math.round(((totalUsers - churnedUsers) / totalUsers) * 100)}%` 
            : '0%'}
        </p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-medium text-gray-700">Valor por Usuario</h3>
        <p className="text-3xl font-bold text-gray-900">
          {totalUsers > 0 
            ? `$${(estimatedRevenue / totalUsers).toFixed(2)}` 
            : '$0.00'}
        </p>
      </div>
    </div>
  </div>
);

// Componente principal del dashboard
function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch<DashboardData>('/rest/admin/overview');
        setDashboardData(data);
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
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  // Calcular total de usuarios
  const totalUsers = Object.values(dashboardData.plan_distribution).reduce(
    (sum, count) => sum + count, 0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
  );
}

export default withAuth(AdminDashboard, ["admin"]);