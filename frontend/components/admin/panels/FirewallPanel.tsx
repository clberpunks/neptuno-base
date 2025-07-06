import { MetricCard } from './MetricCard';

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

interface FirewallPanelProps {
  stats: FirewallStats;
}

export const FirewallPanel = ({ stats }: FirewallPanelProps) => {
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