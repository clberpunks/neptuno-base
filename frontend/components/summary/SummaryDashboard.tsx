// components/SummaryDashboard.tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import { useTranslation } from "next-i18next";
import {
  FiBell,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiBarChart,
  FiUserX,
  FiUserCheck,
  FiZap,
  FiBookOpen,
} from "react-icons/fi";

interface DashboardData {
  unreadNotifications: number;
  riskData: {
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
    protectionLevel: "low" | "medium" | "high";
  };
  onboardingProgress: {
    completed: number;
    total: number;
  };
}

interface UserNotification {
  id: string;
  title: string;
  body?: string;
  created_at: string;
  read: boolean;
}

export default function SummaryDashboard() {
  const { t } = useTranslation("common");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener datos de notificaciones
        const notifications = await apiFetch<UserNotification[]>(
          "/rest/user/notifications"
        );
        const unreadNotifications = notifications.filter((n) => !n.read).length;

        // Obtener datos de riesgo
        const riskData = await apiFetch<any>("/rest/logs/insights");

        // Obtener progreso de onboarding (simulado)
        const onboardingProgress = {
          completed: 3,
          total: 5,
        };

        setDashboardData({
          unreadNotifications,
          riskData,
          onboardingProgress,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t("dashboard_summary")}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Notificaciones sin leer */}
        <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-indigo-100 p-2 rounded-full mb-2">
            <FiBell className="text-indigo-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.unreadNotifications}
          </span>
          <span className="text-xs text-indigo-600 mt-1">
            {t("unread_notifications")}
          </span>
        </div>

        {/* Bots detectados */}
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-blue-100 p-2 rounded-full mb-2">
            <FiBarChart className="text-blue-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.riskData.last7days.totalDetected}
          </span>
          <span className="text-xs text-blue-600 mt-1">
            {t("total_detected")}
          </span>
        </div>

        {/* Bots disuadidos */}
        <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-red-100 p-2 rounded-full mb-2">
            <FiUserX className="text-red-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.riskData.last7days.blocked}
          </span>
          <span className="text-xs text-red-600 mt-1">{t("bots_blocked")}</span>
        </div>

        {/* Bots limitados */}
        <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-yellow-100 p-2 rounded-full mb-2">
            <FiUserCheck className="text-yellow-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.riskData.last7days.limited}
          </span>
          <span className="text-xs text-yellow-600 mt-1">
            {t("bots_limited")}
          </span>
        </div>

        {/* Bots permitidos */}
        <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-green-100 p-2 rounded-full mb-2">
            <FiCheckCircle className="text-green-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.riskData.last7days.allowed}
          </span>
          <span className="text-xs text-green-600 mt-1">
            {t("bots_allowed")}
          </span>
        </div>

        {/* Situación de riesgo */}
        <div
          className={`rounded-lg p-4 flex flex-col items-center ${
            riskStatusColor[dashboardData.riskData.last24h.riskLevel]
          }`}
        >
          <div className="p-2 rounded-full mb-2">
            <FiAlertTriangle className="text-current text-xl" />
          </div>
          <span className="text-xl font-bold">
            {riskText[dashboardData.riskData.last24h.riskLevel]}
          </span>
          <span className="text-xs text-current mt-1">{t("current_risk")}</span>
        </div>

        {/* Nivel de protección */}
        <div
          className={`rounded-lg p-4 flex flex-col items-center ${
            protectionLevelColor[dashboardData.riskData.protectionLevel]
          }`}
        >
          <div className="p-2 rounded-full mb-2">
            <FiShield className="text-current text-xl" />
          </div>
          <span className="text-xl font-bold">
            {protectionText[dashboardData.riskData.protectionLevel]}
          </span>
          <span className="text-xs text-current mt-1">
            {t("protection_level")}
          </span>
        </div>

        {/* Tutoriales completados */}
        <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-purple-100 p-2 rounded-full mb-2">
            <FiBookOpen className="text-purple-600 text-xl" />
          </div>
          <span className="text-3xl font-bold">
            {dashboardData.onboardingProgress.completed}/
            {dashboardData.onboardingProgress.total}
          </span>
          <span className="text-xs text-purple-600 mt-1">
            {t("tutorials_completed")}
          </span>
        </div>
      </div>
    </div>
  );
}
