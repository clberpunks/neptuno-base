// components/Radar.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useRadarNotifications } from "../../hooks/useRadarNotifications";
import SummaryCharts from "./SummaryCharts";
import UsageLimits from "./UsageLimits";
import RecentDetections from "./RecentDetections";
import TrackingCodePanel from "./TrackingCode";
import CollapsiblePanel from "../shared/CollapsiblePanel";
import { Pie, Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { t } from "i18next";
import { Stats, Log } from "../types/radar";

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
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const unseen = useRadarNotifications();

  useEffect(() => {
    Promise.all([
      apiFetch("/api/logs/stats") as Promise<Stats>,
      apiFetch("/api/logs") as Promise<Log[]>,
      apiFetch('/rest/logs/mark-seen', { method: "POST" })
    ])
      .then(([statsData, logsData]) => {
        setStats(statsData);
        setLogs(logsData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-4">
      <SummaryCharts stats={stats} logs={logs} loading={loading} />
      
      <UsageLimits logs={logs} />
      
      <RecentDetections logs={logs} loading={loading} />

      <CollapsiblePanel title={t("tracking_code")}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <code className="text-sm text-gray-800">
            <TrackingCodePanel />
          </code>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {t("tracking_code_instructions")}
        </p>
      </CollapsiblePanel>
    </div>
  );
}