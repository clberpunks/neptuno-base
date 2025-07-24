// frontend/components/radar/AdvancedInsights.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import ExpandablePanel from "../shared/ExpandablePanel";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "next-i18next";

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

interface AdvancedInsightsProps {
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
}

export default function AdvancedInsights({ range }: AdvancedInsightsProps) {
  const { t } = useTranslation("common");
  const [data, setData] = useState<AdvancedInsights | null>(null);

  useEffect(() => {
    apiFetch<AdvancedInsights>(`/rest/logs/advanced-insights?range=${range}`).then(setData);
  }, [range]);

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
      title={t("advanced_insights")}
      statusLabel={t("view_details")}
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title={t("traffic_by_agent_type")}>
          <ul>
            {data.trafficByAgentType.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span>{item.key}</span>
                <span>{item.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("most_active_agents")}>
          <ul>
            {data.mostActiveAgents.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span>{item.key}</span>
                <span>{item.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("top_originating_countries")}>
          <ul>
            {data.topOriginatingCountries.map((item) => (
              <li key={item.key} className="flex justify-between">
                <span>{item.key}</span>
                <span>{item.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("click_through_rate")}>
          <p>{t("clicks")}: {data.referralClickRate.clicks}</p>
          <p>{t("impressions")}: {data.referralClickRate.impressions}</p>
          <p>{t("ctr")}: {data.referralClickRate.rate}%</p>
        </Card>
        <Card title={t("top_referred_pages")}>
          <ul>
            {data.topReferredPages.map((i) => (
              <li key={i.key} className="flex justify-between">
                <span>{i.key}</span>
                <span>{i.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("traffic_by_llm_referrer")}>
          <ul>
            {data.trafficByLLMReferrer.map((i) => (
              <li key={i.key} className="flex justify-between">
                <span>{i.key}</span>
                <span>{i.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("time_spent_browsing")}>
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