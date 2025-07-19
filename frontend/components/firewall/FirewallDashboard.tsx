// components/FirewallDashboard.tsx
// components/FirewallDashboard.tsx
import { useTranslation } from "next-i18next";
import {
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiDollarSign,
  FiHash,
  FiTag,
  FiFileText,
  FiShield,
  FiPower,
  FiRadio
} from "react-icons/fi";
import DashboardCard from "../shared/DashboardCard";

interface FirewallDashboardProps {
  rules: {
    id?: string;
    llm_name: string;
    pattern: string;
    policy: "allow" | "block" | "restricted" | "tariff";
    limit?: number | null;
    fee?: number | null;
  }[];
  metaTagsCount?: number;
  termsStatus?: string;
  privacyStatus?: string;
  isFirewallActive?: boolean; // Nueva prop para estado del firewall
  hasTrackingData?: boolean; // Nueva prop para pixel de seguimiento
}

export default function FirewallDashboard({ 
  rules, 
  metaTagsCount = 0,
  termsStatus = "Active",
  privacyStatus = "Active",
  isFirewallActive,
  hasTrackingData
}: FirewallDashboardProps) {
  const { t } = useTranslation("common");

  // Calcular estadísticas de firewall
  const blockedCount = rules.filter((r) => r.policy === "block").length;
  const allowedCount = rules.filter((r) => r.policy === "allow").length;
  const restrictedCount = rules.filter((r) => r.policy === "restricted").length;
  const tariffCount = rules.filter((r) => r.policy === "tariff").length;
  const totalTokens = rules
    .filter((r) => r.policy === "restricted" && r.limit)
    .reduce((acc, r) => acc + (r.limit || 0), 0);

  // Calcular estadísticas de SEO
  const seoBlockedCount = rules.filter(r => r.policy === "block").length;
  const seoAllowedCount = rules.filter(r => r.policy === "allow").length;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 mb-6">
      <div className="space-y-3">
        {/* Fila 1: Nuevos KPIs + KPIs principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Estado del firewall */}
          <DashboardCard 
            icon={<FiPower className="text-current text-lg" />}
            value={isFirewallActive ? t("active") : t("inactive")}
            label={t("firewall_status")}
            color={isFirewallActive ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_firewall_status")}
          />

          {/* 2. Pixel de seguimiento */}
          <DashboardCard 
            icon={<FiRadio className="text-current text-lg" />}
            value={hasTrackingData ? t("on") : t("waiting")}
            label={t("tracking_pixel")}
            color={hasTrackingData ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-800"}
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_tracking_status")}
          />

          {/* 3. Permitidos */}
          <DashboardCard 
            icon={<FiCheckCircle className="text-green-600 text-lg" />}
            value={allowedCount}
            label={t("allowed_rules")}
            color="bg-green-50 text-green-800"
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_allowed_rules")}
          />

          {/* 4. Bloqueados */}
          <DashboardCard 
            icon={<FiXCircle className="text-red-600 text-lg" />}
            value={blockedCount}
            label={t("blocked_rules")}
            color="bg-red-50 text-red-800"
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_blocked_rules")}
          />
        </div>

        {/* Fila 2: Resto de KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Restringidos */}
          <DashboardCard 
            icon={<FiLock className="text-amber-600 text-lg" />}
            value={restrictedCount}
            label={t("restricted_rules")}
            color="bg-amber-50 text-amber-800"
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_restricted_rules")}
          />

          {/* Tarifas */}
          <DashboardCard 
            icon={<FiDollarSign className="text-blue-600 text-lg" />}
            value={tariffCount}
            label={t("tariff_rules")}
            color="bg-blue-50 text-blue-800"
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_tariff_rules")}
          />

          {/* Tokens permitidos */}
          <DashboardCard 
            icon={<FiHash className="text-purple-600 text-lg" />}
            value={totalTokens.toLocaleString()}
            label={t("total_tokens")}
            color="bg-purple-50 text-purple-800"
            onClick={() => scrollToSection("firewall-management")}
            ariaLabel={t("view_total_tokens")}
          />

          {/* Meta tags generados */}
          <DashboardCard 
            icon={<FiTag className="text-indigo-600 text-lg" />}
            value={seoBlockedCount + seoAllowedCount}
            label={t("seo_rules")}
            color="bg-indigo-50 text-indigo-800"
            onClick={() => scrollToSection("meta-seo")}
            ariaLabel={t("view_seo_rules")}
          />
        </div>

        {/* Fila 3: KPIs de Legal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Términos de servicio */}
          <DashboardCard 
            icon={<FiFileText className="text-amber-600 text-lg" />}
            value={termsStatus}
            label={t("terms_status")}
            color="bg-amber-50 text-amber-800"
            onClick={() => scrollToSection("terms")}
            ariaLabel={t("view_terms_status")}
          />

          {/* Política de privacidad */}
          <DashboardCard 
            icon={<FiShield className="text-cyan-600 text-lg" />}
            value={privacyStatus}
            label={t("privacy_status")}
            color="bg-cyan-50 text-cyan-800"
            onClick={() => scrollToSection("privacy")}
            ariaLabel={t("view_privacy_status")}
          />
        </div>
      </div>
    </div>
  );
}