// frontend/components/Radar.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { Pie, Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { t } from "i18next";
import TrackingCodePanel from "./TrackingCode";

interface Stats {
  allow: number;
  block: number;
  limit: number;
  ratelimit: number;
  redirect: number;
  flagged: number;
  other: number;
  total: number;
}

interface Log {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  referrer: string | null;
  accept_language: string | null;
  sec_ch_ua: string | null;
  sec_ch_ua_mobile: string | null;
  sec_ch_ua_platform: string | null;
  utm_source: string | null;
  fingerprint: string;
  path: string;
  outcome: string;
  rule: string;
  redirect_url?: string | null;
  js_executed: boolean;
}

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

  useEffect(() => {
    Promise.all([
      apiFetch<Stats>("/api/logs/stats/user"),
      apiFetch<Log[]>("/api/logs"),
      // apiFetch<Rule[]>('/api/firewall'), // ← No necesario para Radar, solo logs y stats
    ])
      .then(([s, l /*, r*/]) => {
        setStats(s);
        setLogs(l);
        // setRules(r.filter(x => x.policy === 'restricted'));
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Pie Resumen ---
  const summaryData = {
    labels: [
      "Allow",
      "Block",
      "Limit",
      "RateLimit",
      "Redirect",
      "Flagged",
      "Other",
    ],
    datasets: [
      {
        data: [
          stats.allow,
          stats.block,
          stats.limit,
          stats.ratelimit,
          stats.redirect,
          stats.flagged,
          stats.other,
        ],
      },
    ],
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
    datasets: [
      {
        label: "Hits/Hora",
        data: hoursRadar.map((h) => hitsByHourRadar[h]),
        fill: false,
      },
    ],
  };

  // --- Consumo de límites ---
  const usageMap: Record<string, { used: number; max: number }> = {};
  logs.forEach((l) => {
    if (l.rule.startsWith("limit:")) {
      const m = l.rule.match(/limit:(.*?)\((\d+)\/(\d+)\)/);
      if (m) usageMap[m[1]] = { used: +m[2], max: +m[3] };
    }
  });
  const limitPatterns = Object.keys(usageMap);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Resumen General</h3>
          <Pie data={summaryData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hits por Agente</h3>
          <Pie
            data={{ labels: agentLabels, datasets: [{ data: agentData }] }}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hits Últimas 24 h</h3>
          <Line data={lineData} />
        </div>
      </div>

      {limitPatterns.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
          {limitPatterns.map((p) => (
            <div key={p} className="text-center">
              <h4 className="font-medium">{p}</h4>
              <Doughnut
                data={{
                  labels: ["Usado", "Restante"],
                  datasets: [
                    {
                      data: [
                        usageMap[p].used,
                        usageMap[p].max - usageMap[p].used,
                      ],
                    },
                  ],
                }}
              />
              <p className="mt-2 text-sm">
                {usageMap[p].used}/{usageMap[p].max} usadas
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <h3 className="font-semibold mb-2">Detecciones Recientes</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Fecha",
                "IP",
                "Ruta",
                "Agente",
                "Referer",
                "UTM",
                "JS",
                "Fingerprint",
                "Accept-Lang",
                "Sec-CH-UA",
                "Sec-CH-Mobile",
                "Sec-CH-Platform",
                "Estado",
                "Regla",
                "Redir URL",
              ].map((h) => (
                <th key={h} className="px-2 py-1 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-2 py-1 whitespace-nowrap">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
                <td className="px-2 py-1 truncate max-w-xs">{l.ip_address}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.path}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.user_agent}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.referrer}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.utm_source}</td>
                <td className="px-2 py-1">{l.js_executed ? "yes" : "no"}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.fingerprint}</td>
                <td className="px-2 py-1 whitespace-nowrap">
                  {l.accept_language}
                </td>
                <td className="px-2 py-1 truncate max-w-xs">{l.sec_ch_ua}</td>
                <td className="px-2 py-1 truncate max-w-xs">
                  {l.sec_ch_ua_mobile}
                </td>
                <td className="px-2 py-1 truncate max-w-xs">
                  {l.sec_ch_ua_platform}
                </td>
                <td className="px-2 py-1 capitalize">{l.outcome}</td>
                <td className="px-2 py-1 whitespace-nowrap">{l.rule}</td>
                <td className="px-2 py-1 truncate max-w-xs">
                  {l.redirect_url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("tracking_code")}</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <code className="text-sm text-gray-800">
            <TrackingCodePanel />
          </code>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {t("tracking_code_instructions")}
        </p>
      </div>
    </div>
  );
}
