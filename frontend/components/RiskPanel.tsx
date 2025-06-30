// components/RiskPanel.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { Pie } from "react-chartjs-2";
import 'chart.js/auto';
import { useTranslation } from "next-i18next";

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
        const data = await apiFetch<RiskData>("/_backend/logs/insights");
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
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-500">{t("no_data_available")}</p>
      </div>
    );
  }

  // Configuración de colores según el nivel de riesgo
  const riskStatusColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  // Configuración de colores para niveles de protección
  const protectionLevelColor = {
    low: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-green-100 text-green-800",
  };

  // Texto descriptivo para niveles de riesgo
  const riskStatusText = {
    low: t("risk_low"),
    medium: t("risk_medium"),
    high: t("risk_high"),
  };

  // Texto descriptivo para niveles de protección
  const protectionLevelText = {
    low: t("protection_low"),
    medium: t("protection_medium"),
    high: t("protection_high"),
  };

  // Datos para el gráfico de tipos de bots
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
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{t("risk_panel_title")}</h2>
      
      {/* Tarjetas de estado actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg ${riskStatusColor[riskData.last24h.riskLevel]}`}>
          <h3 className="text-lg font-semibold">{t("current_situation")}</h3>
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
          <h3 className="text-lg font-semibold">{t("protection_level")}</h3>
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

      {/* Insights de los últimos 7 días */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("last_7_days_insights")}</h3>
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

      {/* Detecciones por tipo de bot */}
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
  );

  
}