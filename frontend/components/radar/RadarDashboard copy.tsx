// components/radar/RadarDashboard.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useTranslation } from "next-i18next";
import {
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
  FiSlash,
  FiNavigation,
  FiFlag,
  FiClock,
  FiHelpCircle,
  FiAlertTriangle,
  FiShield,
  FiEye,
} from "react-icons/fi";

interface RadarDashboardData {
  stats: {
    allow: number;
    block: number;
    limit: number;
    ratelimit: number;
    redirect: number;
    flagged: number;
    other: number;
    total: number;
  };
  insights: {
    last24h: {
      detections: number;
      riskLevel: "low" | "medium" | "high";
    };
    protectionLevel: "low" | "medium" | "high";
  };
  usageLimits: {
    pattern: string;
    used: number;
    max: number;
  }[];
}

export default function RadarDashboard() {
  const { t } = useTranslation("common");
  const [dashboardData, setDashboardData] = useState<RadarDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener estadísticas
        const stats = await apiFetch<any>("/api/logs/stats");

        // Obtener insights de riesgo
        const insights = await apiFetch<any>("/rest/logs/insights");

        // Obtener datos de uso de límites (simulado)
        const usageLimits = [
          { pattern: "API Requests", used: 850, max: 1000 },
          { pattern: "Bot Detection", used: 120, max: 200 },
          { pattern: "User Sessions", used: 450, max: 500 },
        ];

        setDashboardData({
          stats,
          insights,
          usageLimits,
        });
      } catch (err) {
        console.error("Error fetching radar dashboard data:", err);
        setError(t("error_loading_data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
        <p className="text-center text-gray-500 p-6">
          {error || t("no_data_available")}
        </p>
      </div>
    );
  }

  // Colores para niveles de riesgo
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

  // Textos traducidos
  const riskText = {
    low: t("risk_low"),
    medium: t("risk_medium"),
    high: t("risk_high"),
  };

  const protectionText = {
    low: t("protection_low"),
    medium: t("protection_medium"),
    high: t("protection_high"),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 mb-6">
      {/* <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t("radar_dashboard")}</h2>
      </div>
*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Detecciones 24h */}
        <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-purple-100 p-2 rounded-full mb-2">
            <FiEye className="text-purple-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.insights.last24h.detections}
          </span>
          <span className="text-xs text-purple-600 mt-1">
            {t("detections_24h")}
          </span>
        </div>

        {/* Situación de riesgo */}
        <div
          className={`rounded-lg p-4 flex flex-col items-center ${
            riskStatusColor[dashboardData.insights.last24h.riskLevel]
          }`}
        >
          <div className="p-2 rounded-full mb-2">
            <FiAlertTriangle className="text-current text-xl" />
          </div>
          <span className="text-xl font-bold">
            {riskText[dashboardData.insights.last24h.riskLevel]}
          </span>
          <span className="text-xs text-current mt-1">{t("current_risk")}</span>
        </div>

        {/* Nivel de protección */}
        <div
          className={`rounded-lg p-4 flex flex-col items-center ${
            protectionLevelColor[dashboardData.insights.protectionLevel]
          }`}
        >
          <div className="p-2 rounded-full mb-2">
            <FiShield className="text-current text-xl" />
          </div>
          <span className="text-xl font-bold">
            {protectionText[dashboardData.insights.protectionLevel]}
          </span>
          <span className="text-xs text-current mt-1">
            {t("protection_level")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Hits */}
        <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-indigo-100 p-2 rounded-full mb-2">
            <FiBarChart2 className="text-indigo-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.total}
          </span>
          <span className="text-xs text-indigo-600 mt-1">
            {t("total_hits")}
          </span>
        </div>

        {/* Hits Permitidos */}
        <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-green-100 p-2 rounded-full mb-2">
            <FiCheckCircle className="text-green-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.allow}
          </span>
          <span className="text-xs text-green-600 mt-1">{t("allowed")}</span>
        </div>

        {/* Hits Bloqueados */}
        <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-red-100 p-2 rounded-full mb-2">
            <FiXCircle className="text-red-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.block}
          </span>
          <span className="text-xs text-red-600 mt-1">{t("blocked")}</span>
        </div>

        {/* Hits Limitados */}
        <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-yellow-100 p-2 rounded-full mb-2">
            <FiSlash className="text-yellow-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.limit}
          </span>
          <span className="text-xs text-yellow-600 mt-1">{t("limited")}</span>
        </div>

        {/* Hits Redirigidos */}
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-blue-100 p-2 rounded-full mb-2">
            <FiNavigation className="text-blue-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.redirect}
          </span>
          <span className="text-xs text-blue-600 mt-1">{t("redirected")}</span>
        </div>

        {/* Hits Marcados */}
        <div className="bg-pink-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-pink-100 p-2 rounded-full mb-2">
            <FiFlag className="text-pink-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.flagged}
          </span>
          <span className="text-xs text-pink-600 mt-1">{t("flagged")}</span>
        </div>

        {/* Hits con Rate Limit */}
        <div className="bg-orange-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-orange-100 p-2 rounded-full mb-2">
            <FiClock className="text-orange-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.ratelimit}
          </span>
          <span className="text-xs text-orange-600 mt-1">
            {t("rate_limited")}
          </span>
        </div>

        {/* Otros Hits */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-gray-100 p-2 rounded-full mb-2">
            <FiHelpCircle className="text-gray-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.stats.other}
          </span>
          <span className="text-xs text-gray-600 mt-1">{t("other")}</span>
        </div>
      </div>

      {dashboardData.usageLimits.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">{t("usage_limits")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.usageLimits.map((limit, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{limit.pattern}</span>
                  <span className="text-sm">
                    {limit.used}/{limit.max}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      limit.used / limit.max > 0.9
                        ? "bg-red-500"
                        : limit.used / limit.max > 0.75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${(limit.used / limit.max) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">
                  {t("usage")}: {Math.round((limit.used / limit.max) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
