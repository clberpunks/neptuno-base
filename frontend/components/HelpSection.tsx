// components/HelpSection.tsx
import { useTranslation } from "next-i18next";

export default function HelpSection() {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">{t("help_and_support")}</h2>
      
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
            <span className="font-medium">{t("how_to_use_radar")}</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="p-4 border-t hidden">
            <p className="text-gray-600">{t("radar_help_content")}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
            <span className="font-medium">{t("firewall_settings")}</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="p-4 border-t hidden">
            <p className="text-gray-600">{t("firewall_help_content")}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
            <span className="font-medium">{t("profile_management")}</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="p-4 border-t hidden">
            <p className="text-gray-600">{t("profile_help_content")}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
            <span className="font-medium">{t("contact_support")}</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="p-4 border-t hidden">
            <p className="text-gray-600">{t("contact_help_content")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}