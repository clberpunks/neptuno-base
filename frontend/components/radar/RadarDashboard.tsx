// components/radar/RadarDashboard.tsx
// 
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useTranslation } from "next-i18next";
import DashboardCard from "../shared/DashboardCard";

interface RadarDashboardProps {
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y";
}

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

export default function RadarDashboard({ range }: RadarDashboardProps) {
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

        const stats = await apiFetch<any>(`/rest/logs/stats/user?range=${range}`);
        const insights = await apiFetch<any>(`/rest/logs/insights?range=${range}`);

        // Obtener estadísticas
        //const stats = await apiFetch<any>("/api/logs/stats");

        // Obtener insights de riesgo
        //const insights = await apiFetch<any>("/rest/logs/insights");

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
 }, [t, range]);
 
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden p-4"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-center text-gray-700 p-6">
          {error || t("no_data_available")}
        </p>
      </div>
    );
  }

  // Colores para niveles de riesgo (optimizados para accesibilidad)
  const riskStatusColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-800",
  };

  const protectionLevelColor = {
    low: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
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
      <div className="space-y-3">
        {/* Primera fila: Detecciones, Riesgo, Protección */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Detecciones 24h */}
          <DashboardCard
            icon={
              <span className="bg-purple-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </span>
            }
            value={dashboardData.insights.last24h.detections}
            label={t("detections_24h")}
            color="bg-purple-50 text-purple-800"
            onClick={() => {}}
            ariaLabel={t("detections_24h")}
          />

          {/* Situación de riesgo */}
          <DashboardCard
            icon={
              <span className="p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </span>
            }
            value={riskText[dashboardData.insights.last24h.riskLevel]}
            label={t("current_risk")}
            color={riskStatusColor[dashboardData.insights.last24h.riskLevel]}
            onClick={() => {}}
            ariaLabel={t("current_risk")}
          />

          {/* Nivel de protección */}
          <DashboardCard
            icon={
              <span className="p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </span>
            }
            value={protectionText[dashboardData.insights.protectionLevel]}
            label={t("protection_level")}
            color={protectionLevelColor[dashboardData.insights.protectionLevel]}
            onClick={() => {}}
            ariaLabel={t("protection_level")}
          />
        </div>

        {/* Segunda fila: Estadísticas de hits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total Hits */}
          <DashboardCard
            icon={
              <span className="bg-indigo-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.total}
            label={t("total_hits")}
            color="bg-indigo-50 text-indigo-800"
            onClick={() => {}}
            ariaLabel={t("total_hits")}
          />

          {/* Hits Permitidos */}
          <DashboardCard
            icon={
              <span className="bg-green-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.allow}
            label={t("allowed")}
            color="bg-green-50 text-green-800"
            onClick={() => {}}
            ariaLabel={t("allowed")}
          />

          {/* Hits Bloqueados */}
          <DashboardCard
            icon={
              <span className="bg-red-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.block}
            label={t("blocked")}
            color="bg-red-50 text-red-800"
            onClick={() => {}}
            ariaLabel={t("blocked")}
          />

          {/* Hits Limitados */}
          <DashboardCard
            icon={
              <span className="bg-amber-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.limit}
            label={t("limited")}
            color="bg-amber-50 text-amber-800"
            onClick={() => {}}
            ariaLabel={t("limited")}
          />

          {/* Hits Redirigidos */}
          <DashboardCard
            icon={
              <span className="bg-blue-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.redirect}
            label={t("redirected")}
            color="bg-blue-50 text-blue-800"
            onClick={() => {}}
            ariaLabel={t("redirected")}
          />

          {/* Hits Marcados */}
          <DashboardCard
            icon={
              <span className="bg-pink-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.flagged}
            label={t("flagged")}
            color="bg-pink-50 text-pink-800"
            onClick={() => {}}
            ariaLabel={t("flagged")}
          />

          {/* Hits con Rate Limit */}
          <DashboardCard
            icon={
              <span className="bg-orange-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.ratelimit}
            label={t("rate_limited")}
            color="bg-orange-50 text-orange-800"
            onClick={() => {}}
            ariaLabel={t("rate_limited")}
          />

          {/* Otros Hits */}
          <DashboardCard
            icon={
              <span className="bg-gray-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
            }
            value={dashboardData.stats.other}
            label={t("other")}
            color="bg-gray-50 text-gray-800"
            onClick={() => {}}
            ariaLabel={t("other")}
          />
        </div>

        {/* Uso de límites */}
        {dashboardData.usageLimits.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("usage_limits")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dashboardData.usageLimits.map((limit, index) => {
                const percentage = Math.round((limit.used / limit.max) * 100);
                const progressBarColor =
                  percentage > 90
                    ? "bg-red-500"
                    : percentage > 75
                    ? "bg-amber-500"
                    : "bg-green-500";
                const progressTextColor =
                  percentage > 90
                    ? "text-red-700"
                    : percentage > 75
                    ? "text-amber-700"
                    : "text-green-700";

                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3"
                    aria-label={`${limit.pattern}: ${limit.used} de ${limit.max} (${percentage}%)`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">
                        {limit.pattern}
                      </span>
                      <span className="text-xs">
                        {limit.used}/{limit.max}
                      </span>
                    </div>
                    <div
                      className="w-full bg-gray-200 rounded-full h-1.5"
                      role="progressbar"
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-1.5 rounded-full ${progressBarColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-right">
                      <span className={progressTextColor}>
                        {t("usage")}: {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
