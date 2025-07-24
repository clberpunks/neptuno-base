// components/radar/RecentDetections.tsx
// components/radar/RecentDetections.tsx
import { useMemo } from "react";
import { Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("common");

  return (
    <ExpandablePanel
      title={t("recent_detections")}
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
                  "date",
                  "ip",
                  "path",
                  "agent",
                  "referer",
                  "utm",
                  "js",
                  "fingerprint",
                  "accept_lang",
                  "sec_ch_ua",
                  "sec_ch_mobile",
                  "sec_ch_platform",
                  "status",
                  "rule",
                  "redirect_url",
                ].map((key) => (
                  <th key={key} className="px-2 py-1 text-left whitespace-nowrap">
                    {t(key)}
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
                  <td className="px-2 py-1">{l.js_executed ? t("yes") : t("no")}</td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.fingerprint}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{l.accept_language}</td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.sec_ch_ua}</td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.sec_ch_ua_mobile}</td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.sec_ch_ua_platform}</td>
                  <td className="px-2 py-1 capitalize">{l.outcome}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{l.rule}</td>
                  <td className="px-2 py-1 truncate max-w-xs">{l.redirect_url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ExpandablePanel>
  );
}
