// components/SummaryDashboard.tsx
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
import Spinner from "../shared/Spinner";

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
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

      <div className="space-y-4">
        {/* Fila 1: KPIs principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Notificaciones sin leer */}
          <div 
            className="bg-indigo-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("notifications")}
          >
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <FiBell className="text-indigo-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {dashboardData.unreadNotifications}
              </div>
              <div className="text-xs text-indigo-600">
                {t("unread_notifications")}
              </div>
            </div>
          </div>

          {/* Situación de riesgo */}
          <div 
            className={`rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow ${
              riskStatusColor[dashboardData.riskData.last24h.riskLevel]
            }`}
            onClick={() => scrollToSection("risk-panel")}
          >
            <div className="p-2 rounded-full mr-3">
              <FiAlertTriangle className="text-current text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {riskText[dashboardData.riskData.last24h.riskLevel]}
              </div>
              <div className="text-xs text-current">
                {t("current_risk")}
              </div>
            </div>
          </div>

          {/* Nivel de protección */}
          <div 
            className={`rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow ${
              protectionLevelColor[dashboardData.riskData.protectionLevel]
            }`}
            onClick={() => scrollToSection("risk-panel")}
          >
            <div className="p-2 rounded-full mr-3">
              <FiShield className="text-current text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {protectionText[dashboardData.riskData.protectionLevel]}
              </div>
              <div className="text-xs text-current">
                {t("protection_level")}
              </div>
            </div>
          </div>

          {/* Tutoriales completados */}
          <div 
            className="bg-purple-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("onboarding")}
          >
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <FiBookOpen className="text-purple-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {dashboardData.onboardingProgress.completed}/
                {dashboardData.onboardingProgress.total}
              </div>
              <div className="text-xs text-purple-600">
                {t("tutorials_completed")}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: KPIs secundarios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Bots detectados */}
          <div 
            className="bg-blue-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("risk-panel")}
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FiBarChart className="text-blue-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {dashboardData.riskData.last7days.totalDetected}
              </div>
              <div className="text-xs text-blue-600">
                {t("total_detected")}
              </div>
            </div>
          </div>

          {/* Bots disuadidos */}
          <div 
            className="bg-red-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("risk-panel")}
          >
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <FiUserX className="text-red-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {dashboardData.riskData.last7days.blocked}
              </div>
              <div className="text-xs text-red-600">{t("bots_blocked")}</div>
            </div>
          </div>

          {/* Bots limitados */}
          <div 
            className="bg-yellow-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("risk-panel")}
          >
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FiUserCheck className="text-yellow-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {dashboardData.riskData.last7days.limited}
              </div>
              <div className="text-xs text-yellow-600">
                {t("bots_limited")}
              </div>
            </div>
          </div>

          {/* Bots permitidos */}
          <div 
            className="bg-green-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("risk-panel")}
          >
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FiCheckCircle className="text-green-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {dashboardData.riskData.last7days.allowed}
              </div>
              <div className="text-xs text-green-600">
                {t("bots_allowed")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}