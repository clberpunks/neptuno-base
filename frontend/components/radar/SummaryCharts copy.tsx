// components/radar/SummaryCharts.tsx
// components/radar/SummaryCharts.tsx
import { Pie, Line } from "react-chartjs-2";
import { Stats, Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";
import "chart.js/auto";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import Spinner from "../shared/Spinner";
import { useTranslation } from "next-i18next";

interface SummaryChartsProps {
  stats: Stats;
  logs: Log[];
  loading: boolean;
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
}

export default function SummaryCharts({
  stats, logs, loading, range
}: SummaryChartsProps) {
  const { t } = useTranslation("common");

  const summaryData = {
    labels: [
      t("allow"),
      t("block"),
      t("limit"),
      t("rate_limited_short"),
      t("redirected"),
      t("flagged"),
      t("other")
    ],
    datasets: [{
      data: [
        stats.allow,
        stats.block,
        stats.limit,
        stats.ratelimit,
        stats.redirect,
        stats.flagged,
        stats.other
      ],
      backgroundColor: ['#4ade80', '#f87171', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8'],
      borderWidth: 1
    }]
  };

  const { agentLabels, agentData } = useMemo(() => {
    const byAgent: Record<string, number> = {};
    logs.forEach(l => {
      const k = l.user_agent.split(/[\/\s]/)[0] || "Unknown";
      byAgent[k] = (byAgent[k] || 0) + 1;
    });
    const labels = Object.keys(byAgent);
    return { agentLabels: labels, agentData: labels.map(l => byAgent[l]) };
  }, [logs]);

  const { timeLabels, timeData } = useMemo(() => {
    const now = new Date();
    let buckets: string[] = [];
    let counts: Record<string, number> = {};

    if (range === "24h") {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const label = `${d.getHours().toString().padStart(2, '0')}:00`;
        buckets.push(label);
        counts[label] = 0;
      }
    } else if (range === "7d") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        buckets.push(label);
        counts[label] = 0;
      }
    } else if (range === "15d") {
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        buckets.push(label);
        counts[label] = 0;
      }
    } else if (range === "1m") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        buckets.push(label);
        counts[label] = 0;
      }
    } else if (range === "6m") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        buckets.push(label);
        counts[label] = 0;
      }
    } else { // 1y
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        buckets.push(label);
        counts[label] = 0;
      }
    }

    logs.forEach(l => {
      const d = new Date(l.timestamp);
      let label = "";
      if (range === "24h") {
        label = `${d.getHours().toString().padStart(2, '0')}:00`;
      } else if (["7d", "15d", "1m"].includes(range)) {
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else if (range === "6m") {
        label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      } else { // 1y
        label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }
      if (counts[label] !== undefined) {
        counts[label]++;
      }
    });

    return { timeLabels: buckets, timeData: buckets.map(b => counts[b] || 0) };
  }, [logs, range]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <ExpandablePanel
      title={t("radar_statistics")}
      icon={<ChartBarIcon className="h-6 w-6" />}
      statusLabel={`${stats.total} ${t("hits")}`}
      statusColor="bg-blue-100 text-blue-800"
      defaultExpanded
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">{t("general_summary")}</h3>
          <Pie data={summaryData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">{t("hits_by_agent")}</h3>
          <Pie data={{ labels: agentLabels, datasets: [{ data: agentData }] }} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">
            {t("hits_last")} {t(`range_${range}`)}
          </h3>
          <Line
            data={{
              labels: timeLabels,
              datasets: [{
                label: t("hits"),
                data: timeData,
                fill: false,
                tension: 0.1
              }]
            }}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>
      </div>
    </ExpandablePanel>
  );
}