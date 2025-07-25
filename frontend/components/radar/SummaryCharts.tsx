// components/radar/SummaryCharts.tsx
// components/radar/SummaryCharts.tsx
import { Pie, Line, Bar } from "react-chartjs-2";
import { Stats, Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";
import "chart.js/auto";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useMemo, useState, useEffect, useCallback } from "react";
import Spinner from "../shared/Spinner";
import { useTranslation } from "next-i18next";
import { apiFetch } from "../../utils/api";

interface SummaryChartsProps {
  stats: Stats;
  logs: Log[];
  loading: boolean;
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
}

interface TimeData {
  labels: string[];
  data: number[];
}

export default function SummaryCharts({
  stats, logs, loading, range
}: SummaryChartsProps) {
  const { t } = useTranslation("common");
  const [timeData24h, setTimeData24h] = useState<TimeData | null>(null);
  const [timeData15d, setTimeData15d] = useState<TimeData | null>(null);
  const [timeData6m, setTimeData6m] = useState<TimeData | null>(null);
  const [loadingTimeData, setLoadingTimeData] = useState(true);


  // Obtener datos para un rango específico
  const fetchTimeDataForRange = useCallback(async (range: string): Promise<TimeData> => {
    const logs = await apiFetch<Log[]>(`/rest/logs/?range=${range}&limit=10000`);
    return processTimeData(logs, range);
  }, []);

  // Cargar datos para múltiples rangos temporales
  useEffect(() => {
    const fetchTimeData = async () => {
      setLoadingTimeData(true);
      try {
        const [data24h, data15d, data6m] = await Promise.all([
          fetchTimeDataForRange("24h"),
          fetchTimeDataForRange("15d"),
          fetchTimeDataForRange("6m")
        ]);
        
        setTimeData24h(data24h);
        setTimeData15d(data15d);
        setTimeData6m(data6m);
      } catch (error) {
        console.error("Error fetching time data:", error);
      } finally {
        setLoadingTimeData(false);
      }
    };

    fetchTimeData();
  }, [fetchTimeDataForRange]);

  // Procesar datos temporales
  const processTimeData = (logs: Log[], range: string): TimeData => {
    const now = new Date();
    let buckets: string[] = [];
    let counts: Record<string, number> = {};

    if (range === "24h") {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const label = `${d.getHours().toString().padStart(2, '0')}:00`;
        buckets.push(label);
        counts[label] = 0;
      }
    } else if (range === "15d") {
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        buckets.push(label);
        counts[label] = 0;
      }
    } else if (range === "6m") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        buckets.push(label);
        counts[label] = 0;
      }
    }

    logs.forEach(l => {
      const d = new Date(l.timestamp);
      let label = "";
      if (range === "24h") {
        label = `${d.getHours().toString().padStart(2, '0')}:00`;
      } else if (range === "15d") {
        label = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      } else if (range === "6m") {
        label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      }
      
      if (counts[label] !== undefined) {
        counts[label]++;
      }
    });

    return { labels: buckets, data: buckets.map(b => counts[b] || 0) };
  };

  // Datos para gráficos
  const summaryData = {
    labels: [
      t("allow"),
      t("block"),
      t("limit"),
      t("rate_limited_short"),
      t("redirected"),
      t("flagged"),
      t("other")
    ],
    datasets: [{
      data: [
        stats.allow,
        stats.block,
        stats.limit,
        stats.ratelimit,
        stats.redirect,
        stats.flagged,
        stats.other
      ],
      backgroundColor: [
        '#4ade80', '#f87171', '#fbbf24', 
        '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8'
      ],
      borderWidth: 1
    }]
  };

  const agentData = useMemo(() => {
    const byAgent: Record<string, number> = {};
    logs.forEach(l => {
      const agent = l.user_agent.split(/[\/\s]/)[0] || t("unknown");
      byAgent[agent] = (byAgent[agent] || 0) + 1;
    });
    
    // Ordenar y limitar a los 10 principales
    const sortedAgents = Object.entries(byAgent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      labels: sortedAgents.map(a => a[0]),
      data: sortedAgents.map(a => a[1])
    };
  }, [logs, t]);

  // Datos para gráfico combinado de agentes
  const combinedAgentData = {
    labels: agentData.labels,
    datasets: [
      {
        label: t("hits"),
        data: agentData.data,
        backgroundColor: '#4f46e5',
        borderColor: '#3730a3',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Plantilla para tarjetas de gráficos
  const ChartCard = ({ 
    title, 
    children,
    ariaLabel
  }: {
    title: string;
    children: React.ReactNode;
    ariaLabel: string;
  }) => (
    <div 
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
      aria-label={ariaLabel}
      role="region"
    >
      <h3 className="font-medium text-sm text-gray-900 mb-2">{title}</h3>
      <div className="h-48 flex items-center justify-center">
        {children}
      </div>
    </div>
  );

  if (loading || loadingTimeData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <ExpandablePanel
      title={t("radar_statistics")}
      icon={<ChartBarIcon className="h-5 w-5" />}
      statusLabel={`${stats.total} ${t("hits")}`}
      statusColor="bg-blue-100 text-blue-800"
      defaultExpanded
      ariaLabel={t("radar_statistics_aria")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Resumen general */}
        <ChartCard 
          title={t("general_summary")} 
          ariaLabel={t("general_summary_aria")}
        >
          <Pie 
            data={summaryData} 
            options={{ 
              plugins: { 
                legend: { 
                  position: 'right',
                  labels: { font: { size: 10 } }
                } 
              } 
            }} 
          />
        </ChartCard>

        {/* Accesos por agente */}
        <ChartCard 
          title={t("hits_by_agent")} 
          ariaLabel={t("hits_by_agent_aria")}
        >
          <Bar 
            data={combinedAgentData} 
            options={{ 
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: { 
                x: { beginAtZero: true, grid: { display: false } },
                y: { grid: { display: false } }
              }
            }} 
          />
        </ChartCard>

        {/* Hits últimas 24h */}
        <ChartCard 
          title={t("hits_last_24h")} 
          ariaLabel={t("hits_last_24h_aria")}
        >
          {timeData24h ? (
            <Line 
              data={{
                labels: timeData24h.labels,
                datasets: [{
                  label: t("hits"),
                  data: timeData24h.data,
                  fill: true,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderColor: '#3b82f6',
                  tension: 0.3,
                  pointRadius: 0
                }]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          ) : <Spinner />}
        </ChartCard>

        {/* Hits últimos 15 días */}
        <ChartCard 
          title={t("hits_last_15d")} 
          ariaLabel={t("hits_last_15d_aria")}
        >
          {timeData15d ? (
            <Line 
              data={{
                labels: timeData15d.labels,
                datasets: [{
                  label: t("hits"),
                  data: timeData15d.data,
                  fill: true,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: '#10b981',
                  tension: 0.3,
                  pointRadius: 0
                }]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          ) : <Spinner />}
        </ChartCard>

        {/* Hits últimos 6 meses */}
        <ChartCard 
          title={t("hits_last_6m")} 
          ariaLabel={t("hits_last_6m_aria")}
        >
          {timeData6m ? (
            <Bar 
              data={{
                labels: timeData6m.labels,
                datasets: [{
                  label: t("hits"),
                  data: timeData6m.data,
                  backgroundColor: '#8b5cf6',
                  borderColor: '#7c3aed',
                  borderWidth: 1,
                  borderRadius: 4
                }]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          ) : <Spinner />}
        </ChartCard>

        {/* Distribución geográfica */}
        <ChartCard 
          title={t("geographic_distribution")} 
          ariaLabel={t("geographic_distribution_aria")}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            <p className="text-sm text-gray-500 ml-3">{t("coming_soon")}</p>
          </div>
        </ChartCard>

        {/* Detección de amenazas */}
        <ChartCard 
          title={t("threat_detection")} 
          ariaLabel={t("threat_detection_aria")}
        >
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{t("malicious_activity")}</span>
              <span>42%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-red-600 h-1.5 rounded-full" 
                style={{ width: '42%' }}
                role="progressbar"
                aria-valuenow={42}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </ChartCard>

        {/* Tendencias de seguridad */}
        <ChartCard 
          title={t("security_trends")} 
          ariaLabel={t("security_trends_aria")}
        >
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{t("blocked_requests")}</span>
              <span>24% ↑</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full" 
                style={{ width: '24%' }}
                role="progressbar"
                aria-valuenow={24}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </ChartCard>
      </div>
    </ExpandablePanel>
  );
}