// components/radar/SummaryCharts.tsx
import { Pie, Line } from "react-chartjs-2";
import { Stats, Log } from "../types/radar";
import CollapsiblePanel from "../shared/CollapsiblePanel";
import "chart.js/auto";

interface SummaryChartsProps {
  stats: Stats;
  logs: Log[];
  loading: boolean;
}

export default function SummaryCharts({ stats, logs, loading }: SummaryChartsProps) {
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
  const byAgent = logs.reduce<Record<string, number>>((acc, l) => {
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
  
  // Generar horas para las últimas 24h
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowRadar.getTime() - i * 3600_000);
    const label = d.getHours().toString().padStart(2, "0") + ":00";
    hoursRadar.push(label);
    hitsByHourRadar[label] = 0;
  }
  
  // Contar hits por hora
  logs.forEach((l) => {
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
    }],
  };

  if (loading) return (
    <CollapsiblePanel title="Estadísticas de Radar" loading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64 animate-pulse" />
    </CollapsiblePanel>
  );

  return (
    <CollapsiblePanel title="Estadísticas de Radar" defaultExpanded>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Resumen General</h3>
          <Pie data={summaryData} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hits por Agente</h3>
          <Pie data={{ labels: agentLabels, datasets: [{ data: agentData }] }} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hits Últimas 24 h</h3>
          <Line data={lineData} />
        </div>
      </div>
    </CollapsiblePanel>
  );
}