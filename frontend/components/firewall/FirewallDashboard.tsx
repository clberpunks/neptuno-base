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
  FiShield
} from "react-icons/fi";

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
}

export default function FirewallDashboard({ 
  rules, 
  metaTagsCount = 0,
  termsStatus = "Active",
  privacyStatus = "Active"
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t("firewall_dashboard")}</h2>
      </div>

      <div className="space-y-4">
        {/* Fila 1: KPIs de Firewall */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Permitidos */}
          <div 
            className="bg-green-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("firewall-management")}
          >
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FiCheckCircle className="text-green-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {allowedCount}
              </div>
              <div className="text-xs text-green-600">
                {t("allowed_rules")}
              </div>
            </div>
          </div>

          {/* Bloqueados */}
          <div 
            className="bg-red-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("firewall-management")}
          >
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <FiXCircle className="text-red-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {blockedCount}
              </div>
              <div className="text-xs text-red-600">
                {t("blocked_rules")}
              </div>
            </div>
          </div>

          {/* Restringidos */}
          <div 
            className="bg-orange-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("firewall-management")}
          >
            <div className="bg-orange-100 p-2 rounded-full mr-3">
              <FiLock className="text-orange-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {restrictedCount}
              </div>
              <div className="text-xs text-orange-600">
                {t("restricted_rules")}
              </div>
            </div>
          </div>

          {/* Tarifas */}
          <div 
            className="bg-blue-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("firewall-management")}
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FiDollarSign className="text-blue-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {tariffCount}
              </div>
              <div className="text-xs text-blue-600">
                {t("tariff_rules")}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: KPIs de SEO y Legal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tokens permitidos */}
          <div 
            className="bg-purple-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("firewall-management")}
          >
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <FiHash className="text-purple-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {totalTokens.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">
                {t("total_tokens")}
              </div>
            </div>
          </div>

          {/* Meta tags generados */}
          <div 
            className="bg-indigo-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("meta-seo")}
          >
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <FiTag className="text-indigo-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {seoBlockedCount + seoAllowedCount}
              </div>
              <div className="text-xs text-indigo-600">
                {t("seo_rules")}
              </div>
            </div>
          </div>

          {/* Términos de servicio */}
          <div 
            className="bg-amber-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("terms")}
          >
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <FiFileText className="text-amber-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {termsStatus}
              </div>
              <div className="text-xs text-amber-600">
                {t("terms_status")}
              </div>
            </div>
          </div>

          {/* Política de privacidad */}
          <div 
            className="bg-cyan-50 rounded-lg p-3 flex items-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection("privacy")}
          >
            <div className="bg-cyan-100 p-2 rounded-full mr-3">
              <FiShield className="text-cyan-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {privacyStatus}
              </div>
              <div className="text-xs text-cyan-600">
                {t("privacy_status")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}