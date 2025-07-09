// components/radar/SummaryCharts.tsx
import { Pie, Line } from "react-chartjs-2";
import { Stats, Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";
import "chart.js/auto";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface SummaryChartsProps {
  stats: Stats;
  logs: Log[];
  loading: boolean;
}

export default function SummaryCharts({ stats, logs, loading }: SummaryChartsProps) {
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

  const byAgent = logs.reduce<Record<string, number>>((acc, l) => {
    const a = l.user_agent.split(/[\/\s]/)[0];
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});
  const agentLabels = Object.keys(byAgent);
  const agentData = agentLabels.map((k) => byAgent[k]);

  const nowRadar = new Date();
  const hoursRadar: string[] = [];
  const hitsByHourRadar: Record<string, number> = {};
  
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowRadar.getTime() - i * 3600_000);
    const label = d.getHours().toString().padStart(2, "0") + ":00";
    hoursRadar.push(label);
    hitsByHourRadar[label] = 0;
  }
  
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
    <ExpandablePanel
      title="Estadísticas de Radar"
      icon={<ChartBarIcon className="h-6 w-6" />}
      statusLabel="Cargando..."
      statusColor="bg-gray-100 text-gray-800"
      loading
    >
      <div className="grid grid-cols-1 md:grid cracker-cols-3 gap-6 h-64 animate-pulse" />
    </ExpandablePanel>
  );

  return (
    <ExpandablePanel
      title="Estadísticas de Radar"
      icon={<ChartBarIcon className="h-6 w-6" />}
      statusLabel={`${stats.total} hits`}
      statusColor="bg-blue-100 text-blue-800"
      defaultExpanded
    >
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
    </ExpandablePanel>
  );
}