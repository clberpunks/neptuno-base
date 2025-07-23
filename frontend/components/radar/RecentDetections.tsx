// components/radar/RecentDetections.tsx
import { useMemo } from "react";
import { Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";

interface RecentDetectionsProps {
  logs: Log[];
  loading: boolean;
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
}

export default function RecentDetections({
  logs,
  loading,
  range,
}: RecentDetectionsProps) {
const filtered = useMemo(() => {
  if (loading) return [];
  const now = Date.now();
  let cutoff = now;
  if (range === "24h") cutoff -= 24 * 3600000;
  else if (range === "7d") cutoff -= 7 * 24 * 3600000;
  else if (range === "15d") cutoff -= 15 * 24 * 3600000;
  else if (range === "1m") cutoff -= 30 * 24 * 3600000;
  else if (range === "6m") cutoff -= 180 * 24 * 3600000;
  else if (range === "1y") cutoff -= 365 * 24 * 3600000;
  
  return logs.filter((l) => new Date(l.timestamp).getTime() >= cutoff);
}, [logs, loading, range]);

  return (
    <ExpandablePanel
      title="Detecciones Recientes"
      defaultExpanded
      loading={loading}
    >
      {loading ? (
        <div className="h-64 animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
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
              {filtered.map((l) => (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="px-2 py-1 truncate max-w-xs">
                    {l.ip_address}
                  </td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.path}</td>
                  <td className="px-2 py-1 truncate max-w-xs">
                    {l.user_agent}
                  </td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.referrer}</td>
                  <td className="px-2 py-1 truncate max-w-xs">
                    {l.utm_source}
                  </td>
                  <td className="px-2 py-1">{l.js_executed ? "yes" : "no"}</td>
                  <td className="px-2 py-1 truncate max-w-xs">
                    {l.fingerprint}
                  </td>
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
      )}
    </ExpandablePanel>
  );
}
