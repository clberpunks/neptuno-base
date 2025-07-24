// components/radar/AdvancedCharts.tsx
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { Stats, Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";

interface AdvancedChartsProps {
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
}

export default function AdvancedCharts({ range }: AdvancedChartsProps) {
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    apiFetch<any>(`/rest/logs/insights/?range=${range}`).then(setInsights);
  }, [range]);

  if (!insights) return null;

  const rangeLabels = {
    "24h": "24 horas",
    "7d": "7 días",
    "15d": "15 días",
    "1m": "1 mes",
    "6m": "6 meses",
    "1y": "1 año"
  };

  const detectionData = {
    labels: ["Permitido", "Limitado", "Bloqueado"],
    datasets: [{
      label: `Últimos ${rangeLabels[range]}`,
      data: [
        insights.stats.allowed ?? 0,
        insights.stats.limited ?? 0,
        insights.stats.blocked ?? 0,
      ],
      backgroundColor: ["#4ade80", "#fbbf24", "#f87171"]
    }]
  };

  const botData = {
    labels: insights.byBotType?.map(b => b.botType) || [],
    datasets: [{
      label: "Bots detectados",
      data: insights.byBotType?.map(b => b.count) || [],
      backgroundColor: insights.byBotType?.map((_, i) => 
        `hsl(${i * 40}, 70%, 60%)`
      ) || []
    }]
  };

  const radarData = {
    labels: ["Riesgo", "Protección", "Tráfico"],
    datasets: [{
      label: "Nivel general",
      data: [
        insights.riskLevel === "high" ? 100 : 
          insights.riskLevel === "medium" ? 60 : 20,
        insights.protectionLevel === "high" ? 90 : 
          insights.protectionLevel === "medium" ? 60 : 30,
        insights.stats.total ?? 0
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
      statusLabel={`${insights.detections ?? 0} detecciones recientes`}
      statusColor="bg-red-100 text-red-700"
    >
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
