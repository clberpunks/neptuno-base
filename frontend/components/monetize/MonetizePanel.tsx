// frontend/components/monetize/MonetizePanel.tsx

import { useTranslation } from "next-i18next";
import MonetizeDashboard from "./MonetizeDashboard";

export default function MonetizePanel() {
  const { t } = useTranslation("common");
  return (
    <div className="space-y-6">
      {/* 
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("monetization")}</h2>
          <div className="text-sm text-gray-600">
            {t("monetization_subtitle")}
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          {t("monetization_description")}
        </p>
      </div>
      */ }
      <MonetizeDashboard />
    </div>
  );
}