// components/radar/RecentDetections.tsx
import { Log } from "../types/radar";
import CollapsiblePanel from "../shared/CollapsiblePanel";

interface RecentDetectionsProps {
  logs: Log[];
  loading: boolean;
}

export default function RecentDetections({ logs, loading }: RecentDetectionsProps) {
  if (loading) return (
    <CollapsiblePanel title="Detecciones Recientes" loading>
      <div className="h-64 animate-pulse" />
    </CollapsiblePanel>
  );

  return (
    <CollapsiblePanel title="Detecciones Recientes" defaultExpanded>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Fecha", "IP", "Ruta", "Agente", "Referer", "UTM", "JS",
                "Fingerprint", "Accept-Lang", "Sec-CH-UA", "Sec-CH-Mobile",
                "Sec-CH-Platform", "Estado", "Regla", "Redir URL"
              ].map((h) => (
                <th key={h} className="px-2 py-1 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t hover:bg-gray-50">
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
    </CollapsiblePanel>
  );
}