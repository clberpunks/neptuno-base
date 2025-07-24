// components/radar/AdvancedCharts.tsx
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { Stats, Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";
import { useTranslation } from "next-i18next";

export default function AdvancedCharts() {
  const { t } = useTranslation("common");
  type Range = "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
  const [range, setRange] = useState<Range>("24h");
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    apiFetch<Stats>(`/rest/logs/stats?range=${range}`).then(setInsights);
  }, [range]);

  if (!insights) return null;

  const detectionData = {
    labels: [t("allowed"), t("limited"), t("blocked")],
    datasets: [{
      label: t("last_7_days"),
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
      label: t("detected_bots"),
      data: Array.isArray(insights?.byBotType) ? insights.byBotType.map(b => b.count) : [],
      backgroundColor: Array.isArray(insights?.byBotType)
        ? insights.byBotType.map((_, i) => `hsl(${i * 40}, 70%, 60%)`)
        : []
    }]
  };

  const radarData = {
    labels: [t("risk"), t("protection"), t("traffic")],
    datasets: [{
      label: t("general_level"),
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
      title={t("advanced_analysis")}
      defaultExpanded={false}
      statusLabel={`${insights?.last24h?.detections ?? 0} ${t("recent_detections")}`}
      statusColor="bg-red-100 text-red-700"
    >
      <div className="flex justify-end mb-4">
        <select 
          className="border rounded px-2 py-1 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
        >
          <option value="24h">{t("range_24h")}</option>
          <option value="7d">{t("range_7d")}</option>
          <option value="15d">{t("range_15d")}</option>
          <option value="1m">{t("range_1m")}</option>
          <option value="6m">{t("range_6m")}</option>
          <option value="1y">{t("range_1y")}</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-sm mb-2">{t("traffic_comparison")}</h3>
          <Bar data={detectionData} options={{ plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-sm mb-2">{t("detected_bot_types")}</h3>
          <Doughnut data={botData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-sm mb-2">{t("risk_level")}</h3>
          <Radar data={radarData} options={{ scales: { r: { beginAtZero: true, max: 100 } } }} />
        </div>
      </div>
    </ExpandablePanel>
  );
}