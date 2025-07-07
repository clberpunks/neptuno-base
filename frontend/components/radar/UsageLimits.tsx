// components/radar/UsageLimits.tsx
import { Doughnut } from "react-chartjs-2";
import { Log } from "../types/radar";
import CollapsiblePanel from "../shared/CollapsiblePanel";

interface UsageLimitsProps {
  logs: Log[];
}

export default function UsageLimits({ logs }: UsageLimitsProps) {
  const safeLogs = logs ?? [];
  const usageMap: Record<string, { used: number; max: number }> = {};
  safeLogs.forEach((l) => {
    if (l.rule.startsWith("limit:")) {
      const m = l.rule.match(/limit:(.*?)\((\d+)\/(\d+)\)/);
      if (m) usageMap[m[1]] = { used: +m[2], max: +m[3] };
    }
  });
  const limitPatterns = Object.keys(usageMap);

  if (limitPatterns.length === 0) return null;

  return (
    <CollapsiblePanel title="Consumo de Límites">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limitPatterns.map((p) => (
          <div key={p} className="text-center">
            <h4 className="font-medium">{p}</h4>
            <Doughnut
              data={{
                labels: ["Usado", "Restante"],
                datasets: [{
                  data: [usageMap[p].used, usageMap[p].max - usageMap[p].used],
                }],
              }}
            />
            <p className="mt-2 text-sm">
              {usageMap[p].used}/{usageMap[p].max} usadas
            </p>
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  );
}