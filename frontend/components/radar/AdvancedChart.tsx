
// components/radar/AdvancedCharts.tsx
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { Stats, Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";

export default function AdvancedCharts() {
  // Define Range type to allow "24h" as a value
  type Range = "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
  const [range, setRange] = useState<Range>("24h");
  const [insights, setInsights] = useState<any>(null);

useEffect(() => {
     apiFetch<Stats>(`/rest/logs/stats/?range=${range}`).then(setInsights);
  }, [range]);

  if (!insights) return null;

  const detectionData = {
    labels: ["Permitido", "Limitado", "Bloqueado"],
    datasets: [{
      label: "Últimos 7 días",
      data: [
        insights?.last7days?.allowed ?? 0,
        insights?.last7days?.limited ?? 0,
        insights?.last7days?.blocked ?? 0,
      ],
      backgroundColor: ["#4ade80", "#fbbf24", "#f87171"]
    }]
  };

  const botData = {
    labels: Array.isArray(insights?.byBotType) ? insights.byBotType.map(b => b.botType) : [],
    datasets: [{
      label: "Bots detectados",
      data: Array.isArray(insights?.byBotType) ? insights.byBotType.map(b => b.count) : [],
      backgroundColor: Array.isArray(insights?.byBotType)
        ? insights.byBotType.map((_, i) => `hsl(${i * 40}, 70%, 60%)`)
        : []
    }]
  };

  const radarData = {
    labels: ["Riesgo", "Protección", "Tráfico"],
    datasets: [{
      label: "Nivel general",
      data: [
        insights?.last24h?.riskLevel === "high"
          ? 100
          : insights?.last24h?.riskLevel === "medium"
            ? 60
            : 20,
        insights?.protectionLevel === "high"
          ? 90
          : insights?.protectionLevel === "medium"
            ? 60
            : 30,
        insights?.last7days?.totalDetected ?? 0
      ],
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      borderColor: "#6366f1",
      borderWidth: 2
    }]
  };

  return (
    <ExpandablePanel
      title="Análisis Avanzado"
      defaultExpanded={false}
      statusLabel={`${insights?.last24h?.detections ?? 0} detecciones recientes`}
      statusColor="bg-red-100 text-red-700"
    >

      <div className="flex justify-end mb-4">
        <select 
          className="border rounded px-2 py-1 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
        >
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="15d">15d</option>
          <option value="1m">1m</option>
          <option value="6m">6m</option>
          <option value="1y">1y</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-sm mb-2">Comparativa de Tráfico</h3>
          <Bar data={detectionData} options={{ plugins:{legend:{display:false}} }} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-sm mb-2">Tipos de Bots Detectados</h3>
          <Doughnut data={botData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-sm mb-2">Nivel de Riesgo</h3>
          <Radar data={radarData} options={{ scales: { r: { beginAtZero: true, max: 100 } } }} />
        </div>
      </div>
    </ExpandablePanel>
  );
}