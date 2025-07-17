// components/Radar.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useRadarNotifications } from "../../hooks/useRadarNotifications";
import SummaryCharts from "./SummaryCharts";
import UsageLimits from "./UsageLimits";
import RecentDetections from "./RecentDetections";
import TrackingCodePanel from "./TrackingCode";
import ExpandablePanel from "../shared/ExpandablePanel";
import { t } from "i18next";
import { Stats, Log } from "../types/radar";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import AdvancedCharts from "./AdvancedChart";
import AdvancedInsights from "./AdvancesInsights";

type Range = "24h" | "7d" | "1m" | "1y";

export default function Radar() {
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
          apiFetch<Stats>("/api/logs/stats"),
          apiFetch<Log[]>("/api/logs?limit=1000"), // traemos hasta 1000 registros
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
  }, []);

  return (
    <div className="space-y-6 p-4">
      {/* selector de rango */}
      <div className="flex justify-end">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
        >
          <option value="24h">Últimas 24 h</option>
          <option value="7d">Últimos 7 d</option>
          <option value="1m">Último mes</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      <SummaryCharts
        stats={stats}
        logs={allLogs}
        loading={loading}
        range={range}
      />
      <AdvancedCharts />
      <AdvancedInsights />
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
