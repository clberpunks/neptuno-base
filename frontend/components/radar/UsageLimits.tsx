//  frontend/components/radar/UsageLimits.tsx
// frontend/components/radar/UsageLimits.tsx
import { Doughnut } from "react-chartjs-2";
import { Log } from "../types/radar";
import ExpandablePanel from "../shared/ExpandablePanel";
import "chart.js/auto";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";

interface UsageLimitsProps {
  logs: Log[];
}

export default function UsageLimits({ logs }: UsageLimitsProps) {
  const { t } = useTranslation("common");
  const usageMap: Record<string, { used: number; max: number }> = {};

  logs.forEach((l) => {
    if (typeof l.rule === "string" && l.rule.startsWith("limit:")) {
      const m = l.rule.match(/limit:(.*?)\((\d+)\/(\d+)\)/);
      if (m) {
        const key = m[1];
        const used = Number.isFinite(Number(m[2])) ? parseInt(m[2], 10) : 0;
        const max = Number.isFinite(Number(m[3])) ? parseInt(m[3], 10) : 0;
        if (!usageMap[key] || usageMap[key].max < max) {
          usageMap[key] = { used, max };
        }
      }
    }
  });

  const limitPatterns = Object.keys(usageMap);

  if (limitPatterns.length === 0) return null;

  return (
    <ExpandablePanel
      title={t("limits_usage")}
      icon={<ShieldCheckIcon className="h-6 w-6" />}
      statusLabel={`${limitPatterns.length} ${t("limits")}`}
      statusColor="bg-purple-100 text-purple-800"
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limitPatterns.map((p) => (
          <div key={p} className="text-center">
            <h4 className="font-medium">{p}</h4>
            <Doughnut
              data={{
                labels: [t("used"), t("remaining")],
                datasets: [{
                  data: [
                    usageMap[p].used,
                    Math.max(0, usageMap[p].max - usageMap[p].used)
                  ],
                  backgroundColor: ['#f87171', '#d1d5db'],
                }],
              }}
              options={{
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
            <p className="mt-2 text-sm font-medium">
              {usageMap[p].used}/{usageMap[p].max} {t("used_label")}
            </p>
          </div>
        ))}
      </div>
    </ExpandablePanel>
  );
}