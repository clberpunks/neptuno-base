// components/RiskPanel.tsx
// components/RiskPanel.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { Pie } from "react-chartjs-2";
import 'chart.js/auto';
import { useTranslation } from "next-i18next";
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import ExpandablePanel from "../shared/ExpandablePanel";

interface RiskData {
  last24h: {
    detections: number;
    riskLevel: "low" | "medium" | "high";
  };
  last7days: {
    totalDetected: number;
    blocked: number;
    limited: number;
    allowed: number;
  };
  byBotType: Array<{
    botType: string;
    count: number;
  }>;
  protectionLevel: "low" | "medium" | "high";
}

export default function RiskPanel() {
  const { t } = useTranslation('common');
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const data = await apiFetch<RiskData>("/rest/logs/insights");
        setRiskData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching risk insights:", error);
        setError(t("error_loading_data"));
      } finally {
        setLoading(false);
      }
    };
    
    fetchRiskData();
  }, [t]);

  if (loading) {
    return (
      <ExpandablePanel
        title={t("risk_panel_title")}
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        loading={true}
      >
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </ExpandablePanel>
    );
  }

  if (!riskData) {
    return (
      <ExpandablePanel
        title={t("risk_panel_title")}
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
      >
        <p className="p-6 text-gray-500">{t("no_data_available")}</p>
      </ExpandablePanel>
    );
  }

  const riskStatusColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const protectionLevelColor = {
    low: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-green-100 text-green-800",
  };

  const riskStatusText = {
    low: t("risk_low"),
    medium: t("risk_medium"),
    high: t("risk_high"),
  };

  const protectionLevelText = {
    low: t("protection_low"),
    medium: t("protection_medium"),
    high: t("protection_high"),
  };

  const botTypeData = {
    labels: riskData.byBotType.map(bot => bot.botType),
    datasets: [{
      data: riskData.byBotType.map(bot => bot.count),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
      ],
    }]
  };

  return (
    <ExpandablePanel
      title={t("risk_panel_title")}
      description={riskData.last24h.riskLevel === "high" ? t("high_risk_alert") : t("risk_status_monitoring")}
      icon={<ExclamationTriangleIcon className="h-6 w-6" />}
      statusLabel={riskStatusText[riskData.last24h.riskLevel]}
      statusColor={riskStatusColor[riskData.last24h.riskLevel]}
      defaultExpanded={false}
      error={error}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg ${riskStatusColor[riskData.last24h.riskLevel]}`}>
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <h3 className="text-lg font-semibold">{t("current_situation")}</h3>
            </div>
            <div className="mt-2 flex items-center">
              <div className="text-3xl font-bold">{riskStatusText[riskData.last24h.riskLevel]}</div>
              <div className="ml-4">
                <p className="text-sm">{t("detections_24h", { count: riskData.last24h.detections })}</p>
                <p className="text-sm mt-1">
                  {riskData.last24h.riskLevel === "low" && t("risk_low_description")}
                  {riskData.last24h.riskLevel === "medium" && t("risk_medium_description")}
                  {riskData.last24h.riskLevel === "high" && t("risk_high_description")}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${protectionLevelColor[riskData.protectionLevel]}`}>
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-6 w-6" />
              <h3 className="text-lg font-semibold">{t("protection_level")}</h3>
            </div>
            <div className="mt-2 flex items-center">
              <div className="text-3xl font-bold">{protectionLevelText[riskData.protectionLevel]}</div>
              <div className="ml-4">
                <p className="text-sm">{t("current_plan")}</p>
                <p className="text-sm mt-1">
                  {riskData.protectionLevel === "low" && t("protection_low_description")}
                  {riskData.protectionLevel === "medium" && t("protection_medium_description")}
                  {riskData.protectionLevel === "high" && t("protection_high_description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">{t("last_7_days_insights")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{t("total_detected")}</p>
              <p className="text-2xl font-bold">{riskData.last7days.totalDetected}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{t("bots_blocked")}</p>
              <p className="text-2xl font-bold text-red-600">{riskData.last7days.blocked}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{t("bots_limited")}</p>
              <p className="text-2xl font-bold text-yellow-600">{riskData.last7days.limited}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{t("bots_allowed")}</p>
              <p className="text-2xl font-bold text-green-600">{riskData.last7days.allowed}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("detections_by_bot_type")}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">{t("bot_type")}</th>
                    <th className="text-right p-2">{t("detections")}</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData.byBotType.map((bot, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : ''}>
                      <td className="p-2">{bot.botType}</td>
                      <td className="p-2 text-right">{bot.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("distribution")}</h3>
            <div className="bg-gray-50 rounded-lg p-4 h-full">
              <Pie data={botTypeData} options={{ 
                plugins: { 
                  legend: { position: 'bottom' } 
                } 
              }} />
            </div>
          </div>
        </div>
      </div>
    </ExpandablePanel>
  );
}