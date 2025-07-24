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
import DashboardCard from "../shared/DashboardCard";

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
    isProUser: boolean; // Nuevo campo para determinar tipo de suscripción
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

interface SummaryDashboardProps {
  range: "24h" | "7d" | "15d" | "1m" | "6m" | "1y"; // Nuevo prop
}


export default function SummaryDashboard({ range }: SummaryDashboardProps) {
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
        const riskData = await apiFetch<any>(`/rest/logs/insights/?range=${range}`);

        // Añadir información de suscripción (simulada)
        riskData.isProUser = true; // TODO: Cambiar por dato real del backend

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
  }, [t, range]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner />
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



  // Use the mapped data instead of the raw response
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

  const riskText = {
    low: t("risk_low"),
    medium: t("risk_medium"),
    high: t("risk_high"),
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden p-4 mb-6 transition-all duration-300"
      aria-label={t("dashboard_summary")}
    >
      {/* <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t("dashboard_summary")}
        </h2>
      </div>
        */}

      <div className="space-y-3">
        {/* Fila 1: KPIs principales - Nuevo orden */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Notificaciones sin leer */}
          <DashboardCard
            icon={<FiBell className="text-indigo-600 text-lg" />}
            value={dashboardData.unreadNotifications}
            label={t("unread_notifications")}
            color="bg-indigo-50 text-indigo-800"
            onClick={() => scrollToSection("notifications")}
            ariaLabel={t("view_notifications")}
          />

          {/* 2. Nivel de protección - Updated to use mapped data */}
          <DashboardCard
            icon={<FiShield className="text-current text-lg" />}
            value={
              dashboardData?.riskData.isProUser
                ? t("protecting")
                : t("only_analysis")
            }
            label={t("protection_status")}
            color={protectionLevelColor[dashboardData.riskData.protectionLevel || "low"]}
            onClick={() => scrollToSection("risk-panel")}
            ariaLabel={t("view_protection_details")}
          />

          {/* 3. Situación de riesgo - Updated to use mapped data */}
          <DashboardCard
            icon={<FiAlertTriangle className="text-current text-lg" />}
            value={riskText[dashboardData.riskData.last24h.riskLevel || "low"]}
            label={t("current_risk")}
            color={riskStatusColor[dashboardData.riskData.last24h.riskLevel || "low"]}
            onClick={() => scrollToSection("risk-panel")}
            ariaLabel={t("view_risk_details")}
          />

          {/* 4. Tutoriales completados */}
          <DashboardCard
            icon={<FiBookOpen className="text-purple-600 text-lg" />}
            value={`${dashboardData.onboardingProgress.completed}/${dashboardData.onboardingProgress.total}`}
            label={t("tutorials_completed")}
            color="bg-purple-50 text-purple-800"
            onClick={() => scrollToSection("onboarding")}
            ariaLabel={t("view_onboarding_progress")}
          />
        </div>

        {/* Fila 2: KPIs secundarios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total detectados */}
          <DashboardCard
            icon={<FiBarChart className="text-blue-600 text-lg" />}
            value={dashboardData.riskData.last7days.totalDetected || 0}
            label={t("total_detected")}
            color="bg-blue-50 text-blue-800"
            onClick={() => scrollToSection("risk-panel")}
            ariaLabel={t("view_detections_details")}
          />

          {/* Bots disuadidos */}
          <DashboardCard
            icon={<FiUserX className="text-red-600 text-lg" />}
            value={dashboardData.riskData.last7days.blocked || 0}
            label={t("bots_blocked")}
            color="bg-red-50 text-red-800"
            onClick={() => scrollToSection("risk-panel")}
            ariaLabel={t("view_blocked_bots")}
          />

          {/* Bots limitados */}
          <DashboardCard
            icon={<FiUserCheck className="text-amber-600 text-lg" />}
            value={dashboardData.riskData.last7days.limited || 0}
            label={t("bots_limited")}
            color="bg-amber-50 text-amber-800"
            onClick={() => scrollToSection("risk-panel")}
            ariaLabel={t("view_limited_bots")}
          />

          {/* Bots permitidos */}
          <DashboardCard
            icon={<FiCheckCircle className="text-green-600 text-lg" />}
            value={dashboardData.riskData.last7days.allowed || 0}
            label={t("bots_allowed")}
            color="bg-green-50 text-green-800"
            onClick={() => scrollToSection("risk-panel")}
            ariaLabel={t("view_allowed_bots")}
          />
        </div>
      </div>
    </div>
  );
}
