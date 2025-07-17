// frontend/components/radar/AdvancedInsights.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import ExpandablePanel from "../shared/ExpandablePanel";
import { Bar } from "react-chartjs-2";

interface BucketItem {
  key: string;
  count: number;
}
interface CTRItem {
  clicks: number;
  impressions: number;
  rate: number;
}

interface AdvancedInsights {
  trafficByAgentType: BucketItem[];
  mostActiveAgents: BucketItem[];
  topOriginatingCountries: BucketItem[];
  referralClickRate: CTRItem;
  topReferredPages: BucketItem[];
  trafficByLLMReferrer: BucketItem[];
  timeSpentByAgent: BucketItem[];
}

export default function AdvancedInsights() {
  const [data, setData] = useState<AdvancedInsights | null>(null);

  useEffect(() => {
    apiFetch<AdvancedInsights>("/rest/logs/advanced-insights").then(setData);
  }, []);

  if (!data) return null;

  const Card = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <ExpandablePanel
      title="Insights Avanzados"
      statusLabel="Ver detalles"
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Tráfico por Tipo de Agente">
          <ul>
            {data.trafficByAgentType.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span>{item.key}</span>
                <span>{item.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Agentes más Activos">
          <ul>
            {data.mostActiveAgents.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span>{item.key}</span>
                <span>{item.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Países de Origen Top">
          <ul>
            {data.topOriginatingCountries.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span>{item.key}</span>
                <span>{item.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Click-Through Rate">
          <p>Clicks: {data.referralClickRate.clicks}</p>
          <p>Impresiones: {data.referralClickRate.impressions}</p>
          <p>CTR: {data.referralClickRate.rate}%</p>
        </Card>

        <Card title="Top Referred Pages">
          <ul>
            {data.topReferredPages.map((i) => (
              <li key={i.key} className="flex justify-between">
                <span>{i.key}</span>
                <span>{i.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Traffic by LLM Referrer">
          <ul>
            {data.trafficByLLMReferrer.map((i) => (
              <li key={i.key} className="flex justify-between">
                <span>{i.key}</span>
                <span>{i.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Time Spent Browsing (s)">
          {/* Gráfico de barras sencillo */}
          <Bar
            data={{
              labels: data.timeSpentByAgent.map((i) => i.key),
              datasets: [{ data: data.timeSpentByAgent.map((i) => i.count) }],
            }}
            options={{
              indexAxis: "y",
              plugins: { legend: { display: false } },
            }}
          />
        </Card>
      </div>
    </ExpandablePanel>
  );
}
