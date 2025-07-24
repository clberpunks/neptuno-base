// components/monetize/MonetizeDashboard.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { 
  FiCreditCard, 
  FiBarChart, 
  FiBook, 
  FiLock, 
  FiDatabase, 
  FiShield, 
  FiZap,
  FiGlobe
} from "react-icons/fi";

export default function MonetizeDashboard() {
  const { t } = useTranslation("common");
  const [monetizationMethods, setMonetizationMethods] = useState([
    {
      id: "http402",
      name: t("monetize.http402.name"),
      description: t("monetize.http402.description"),
      type: "Técnico",
      icon: <FiCreditCard className="text-blue-600" />,
      color: "bg-blue-50",
      textColor: "text-blue-700",
      enabled: false
    },
    {
      id: "api_rate",
      name: t("monetize.api_rate.name"),
      description: t("monetize.api_rate.description"),
      type: "Técnico",
      icon: <FiBarChart className="text-purple-600" />,
      color: "bg-purple-50",
      textColor: "text-purple-700",
      enabled: true
    },
    {
      id: "subscriptions",
      name: t("monetize.subscriptions.name"),
      description: t("monetize.subscriptions.description"),
      type: "Técnico/Legal",
      icon: <FiBook className="text-indigo-600" />,
      color: "bg-indigo-50",
      textColor: "text-indigo-700",
      enabled: false
    },
    {
      id: "legal_agreements",
      name: t("monetize.legal_agreements.name"),
      description: t("monetize.legal_agreements.description"),
      type: "Legal",
      icon: <FiLock className="text-green-600" />,
      color: "bg-green-50",
      textColor: "text-green-700",
      enabled: false
    },
    {
      id: "blockchain",
      name: t("monetize.blockchain.name"),
      description: t("monetize.blockchain.description"),
      type: "Técnico",
      icon: <FiDatabase className="text-yellow-600" />,
      color: "bg-yellow-50",
      textColor: "text-yellow-700",
      enabled: false
    },
    {
      id: "captchas",
      name: t("monetize.captchas.name"),
      description: t("monetize.captchas.description"),
      type: "Técnico",
      icon: <FiShield className="text-red-600" />,
      color: "bg-red-50",
      textColor: "text-red-700",
      enabled: true
    },
    {
      id: "ip_blocking",
      name: t("monetize.ip_blocking.name"),
      description: t("monetize.ip_blocking.description"),
      type: "Técnico",
      icon: <FiZap className="text-orange-600" />,
      color: "bg-orange-50",
      textColor: "text-orange-700",
      enabled: false
    },
    {
      id: "custom_auth",
      name: t("monetize.custom_auth.name"),
      description: t("monetize.custom_auth.description"),
      type: "Técnico",
      icon: <FiGlobe className="text-pink-600" />,
      color: "bg-pink-50",
      textColor: "text-pink-700",
      enabled: false
    }
  ]);

  const toggleMethod = (id: string) => {
    setMonetizationMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t("monetization_strategies")}</h2>
        <div className="text-sm">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {t("active_methods")}: {monetizationMethods.filter(m => m.enabled).length}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monetizationMethods.map((method) => (
          <div 
            key={method.id}
            className={`rounded-lg border p-4 transition-all duration-200 ${
              method.enabled 
                ? "border-green-300 bg-green-50 shadow-sm" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${method.color}`}>
                  {method.icon}
                </div>
                <div>
                  <h3 className={`font-semibold ${method.textColor}`}>
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {method.description}
                  </p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      method.type.includes("Legal") 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {method.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleMethod(method.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  method.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-label={t("toggle_method")}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    method.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {method.enabled && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <button className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700">
                    {t("configure")}
                  </button>
                  <button className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300">
                    {t("view_stats")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800">{t("monetization_tips")}</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          <li>• {t("tip_combine_methods")}</li>
          <li>• {t("tip_legal_compliance")}</li>
          <li>• {t("tip_user_experience")}</li>
          <li>• {t("tip_analytics")}</li>
        </ul>
      </div>
    </div>
  );
}