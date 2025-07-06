// components/radar/SummaryCharts.tsx
import { Pie, Line } from "react-chartjs-2";
import { Stats, Log } from "../types/radar";
import CollapsiblePanel from "../shared/CollapsiblePanel";

interface SummaryChartsProps {
  stats: Stats;
  logs: Log[];
  loading: boolean;
}

export default function SummaryCharts({ stats, logs, loading }: SummaryChartsProps) {
  // --- Pie Resumen ---
  const summaryData = {
    labels: ["Allow", "Block", "Limit", "RateLimit", "Redirect", "Flagged", "Other"],
    datasets: [{ data: [
      stats.allow,
      stats.block,
      stats.limit,
      stats.ratelimit,
      stats.redirect,
      stats.flagged,
      stats.other,
    ] }],
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
    }],
  };

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white p-4 rounded-lg shadow h-64 animate-pulse" />
    ))}
  </div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CollapsiblePanel title="Resumen General">
        <Pie data={summaryData} />
      </CollapsiblePanel>
      
      <CollapsiblePanel title="Hits por Agente">
        <Pie data={{ labels: agentLabels, datasets: [{ data: agentData }] }} />
      </CollapsiblePanel>
      
      <CollapsiblePanel title="Hits Últimas 24 h">
        <Line data={lineData} />
      </CollapsiblePanel>
    </div>
  );
}