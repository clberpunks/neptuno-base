// frontend/components/radar/Radar.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useRadarNotifications } from "../../hooks/useRadarNotifications";
import SummaryCharts from "./SummaryCharts";
import UsageLimits from "./UsageLimits";
import RecentDetections from "./RecentDetections";
import TrackingCodePanel from "./TrackingCode";
import ExpandablePanel from "../shared/ExpandablePanel";
import { useTranslation } from "next-i18next"; // Import corregido
import { Stats, Log } from "../types/radar";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import AdvancedCharts from "./AdvancedChart";
import AdvancedInsights from "./AdvancesInsights";
import RadarDashboard from "./RadarDashboard";

type Range = "24h" | "7d" | "15d" | "1m" | "6m" | "1y";

export default function Radar() {
  const { t } = useTranslation("common"); // Uso de useTranslation
  const [stats, setStats] = useState<Stats>({
    allow: 0,
    block: 0,
    limit: 0,
    ratelimit: 0,
    redirect: 0,
    flagged: 0,
    other: 0,
    total: 0,
  });
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("24h");
  const unseen = useRadarNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, logsData] = await Promise.all([
          apiFetch<Stats>(`/rest/logs/stats?range=${range}`),
          apiFetch<Log[]>(`/rest/logs/?range=${range}&limit=1000`),
        ]);
        setStats(statsData);
        setAllLogs(logsData);
        apiFetch("/rest/logs/mark-seen", { method: "POST" });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const rangeOptions: { value: Range; label: string }[] = [
    { value: "24h", label: t("range_24h") },
    { value: "7d", label: t("range_7d") },
    { value: "15d", label: t("range_15d") },
    { value: "1m", label: t("range_1m") },
    { value: "6m", label: t("range_6m") },
    { value: "1y", label: t("range_1y") },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* selector de rango */}
      <div className="flex justify-end">
        <div className="flex justify-end gap-2 mb-4 flex-wrap">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === option.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <RadarDashboard range={range} />

      <SummaryCharts stats={stats} logs={allLogs} loading={loading} range={range} />
      <AdvancedCharts />
      <AdvancedInsights range={range} />
      <UsageLimits logs={allLogs} />
      <RecentDetections logs={allLogs} loading={loading} range={range} />
      <ExpandablePanel
        title={t("tracking_code")}
        icon={<CodeBracketIcon className="h-6 w-6" />}
        statusLabel={t("generate_code")}
        statusColor="bg-indigo-100 text-indigo-800"
        defaultExpanded={false}
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <TrackingCodePanel />
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {t("tracking_code_instructions")}
        </p>
      </ExpandablePanel>
    </div>
  );
}