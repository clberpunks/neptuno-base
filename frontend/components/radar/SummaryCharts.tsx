// components/radar/SummaryCharts.tsx
// components/radar/SummaryCharts.tsx
import { Pie, Line, Bar, Doughnut } from "react-chartjs-2";
import { Stats, Log } from "../types/radar";
import CollapsiblePanel from "../shared/CollapsiblePanel";
import { apiFetch } from "../../utils/api";
import { useEffect, useState } from "react";
import "chart.js/auto";

interface SummaryChartsProps {
  stats: Stats;
  logs: Log[];
  loading: boolean;
}

interface InsightsData {
  last24h: {
    detections: number;
    riskLevel: string;
  };
  last7days: {
    totalDetected: number;
    blocked: number;
    limited: number;
    allowed: number;
  };
  byBotType: Array<{
    botType: string;
    count: number;
  }>;
  protectionLevel: string;
}

export default function SummaryCharts({ stats, logs, loading }: SummaryChartsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await apiFetch<InsightsData>("/rest/logs/insights");
        setInsights(data);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setInsightsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  // --- Pie Resumen ---
  const summaryData = {
    labels: ["Allow", "Block", "Limit", "RateLimit", "Redirect", "Flagged", "Other"],
    datasets: [{ 
      data: [
        stats.allow,
        stats.block,
        stats.limit,
        stats.ratelimit,
        stats.redirect,
        stats.flagged,
        stats.other,
      ],
      backgroundColor: [
        '#4ade80', '#f87171', '#fbbf24', 
        '#60a5fa', '#a78bfa', '#f472b6', 
        '#94a3b8'
      ],
      borderWidth: 1
    }],
  };

  // --- Hits por Agente ---
  const safeLogs = logs ?? [];
  const byAgent = safeLogs.reduce<Record<string, number>>((acc, l) => {
    const a = l.user_agent.split(/[\/\s]/)[0];
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});
  const agentLabels = Object.keys(byAgent);
  const agentData = agentLabels.map((k) => byAgent[k]);

  // --- Hits Últimas 24h ---
  const nowRadar = new Date();
  const hoursRadar: string[] = [];
  const hitsByHourRadar: Record<string, number> = {};
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowRadar.getTime() - i * 3600_000);
    const label = d.getHours().toString().padStart(2, "0") + ":00";
    hoursRadar.push(label);
    hitsByHourRadar[label] = 0;
  }
  safeLogs.forEach((l) => {
    const d = new Date(l.timestamp);
    const label = d.getHours().toString().padStart(2, "0") + ":00";
    if (hitsByHourRadar[label] !== undefined) hitsByHourRadar[label]++;
  });
  const lineData = {
    labels: hoursRadar,
    datasets: [{
      label: "Hits/Hora",
      data: hoursRadar.map((h) => hitsByHourRadar[h]),
      fill: false,
      borderColor: '#6366f1',
      tension: 0.1,
      backgroundColor: '#6366f1',
    }],
  };

  // --- Nuevos gráficos ---
  const riskData = {
    labels: ["Bajo", "Medio", "Alto"],
    datasets: [{
      label: "Nivel de Riesgo",
      data: [
        insights?.last24h.riskLevel === "low" ? 1 : 0,
        insights?.last24h.riskLevel === "medium" ? 1 : 0,
        insights?.last24h.riskLevel === "high" ? 1 : 0,
      ],
      backgroundColor: [
        '#4ade80', // Verde para bajo
        '#fbbf24', // Amarillo para medio
        '#f87171'  // Rojo para alto
      ],
      borderWidth: 1
    }]
  };

  const weeklyActivityData = {
    labels: ["Bloqueados", "Limitados", "Permitidos"],
    datasets: [{
      label: "Actividad Semanal",
      data: [
        insights?.last7days.blocked || 0,
        insights?.last7days.limited || 0,
        insights?.last7days.allowed || 0,
      ],
      backgroundColor: [
        '#f87171', // Rojo para bloqueados
        '#fbbf24', // Amarillo para limitados
        '#4ade80'  // Verde para permitidos
      ],
      borderWidth: 1
    }]
  };

  const botTypesData = {
    labels: insights?.byBotType.map(b => b.botType) || [],
    datasets: [{
      label: "Tipos de Bots",
      data: insights?.byBotType.map(b => b.count) || [],
      backgroundColor: [
        '#6366f1', '#8b5cf6', '#ec4899',
        '#f43f5e', '#f97316', '#eab308',
        '#10b981', '#06b6d4'
      ],
      borderWidth: 1
    }]
  };

  if (loading || insightsLoading) return (
    <CollapsiblePanel title="Estadísticas de Radar" loading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96 animate-pulse" />
    </CollapsiblePanel>
  );

  return (
    <CollapsiblePanel title="Estadísticas de Radar" defaultExpanded>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Resumen de Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-center">Resumen General</h4>
              <Pie 
                data={summaryData} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-center">Hits por Agente</h4>
              <Pie 
                data={{ 
                  labels: agentLabels, 
                  datasets: [{ 
                    data: agentData,
                    backgroundColor: [
                      '#6366f1', '#8b5cf6', '#ec4899',
                      '#f43f5e', '#f97316', '#eab308',
                      '#10b981', '#06b6d4'
                    ]
                  }] 
                }} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-center">Hits Últimas 24 h</h4>
              <Line 
                data={lineData} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Análisis de Seguridad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-center">Nivel de Riesgo</h4>
              <Doughnut 
                data={riskData} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
              <p className="text-center mt-2 text-sm">
                {insights?.last24h.detections || 0} detecciones en 24h
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-center">Actividad Semanal</h4>
              <Bar 
                data={weeklyActivityData} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-center">Tipos de Bots</h4>
              <Bar 
                data={botTypesData} 
                options={{ 
                  responsive: true,
                  indexAxis: 'y' as const,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}