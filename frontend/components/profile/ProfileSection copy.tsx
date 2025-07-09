// components/ProfileSection.tsx
import { useTranslation } from "next-i18next";
import Image from "next/image";
import SubscriptionSelector from "./SuscriptionSelector";
import { useState } from "react";
import { toast } from "react-toastify";

interface ProfileSectionProps {
  user: {
    [key: string]: any;
    created_at?: string;
  };
  accessHistory?: Array<{
    timestamp: string;
    login_method: string;
    ip_address: string;
  }>;
  formatDate: (dateString?: string) => string;
}

export default function ProfileSection({
  user,
  accessHistory,
  formatDate,
}: ProfileSectionProps) {
  const { t } = useTranslation("common");
  const [isSending, setIsSending] = useState(false);
  const backendUrl = process.env.BACKEND_URL;
  
  const handleForceSendReport = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/rest/user/send-weekly-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success(t('report_sent_successfully'));
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error(t('failed_to_send_report'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center">
          <Image
            src={`https://ui-avatars.com/api/?name=${user.name}`}
            alt={`${user.name} avatar`}
            width={96}
            height={96}
            className="rounded-full w-24 h-24 md:mr-8 mb-6 md:mb-0 border-4 border-indigo-100"
            priority
            unoptimized={process.env.NODE_ENV === "development"}
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {user.role}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t("account_status")}</h3>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-700">{t("active")}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t("created_at")}</h3>
          <p className="text-gray-700">{formatDate(user.created_at)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t("last_login")}</h3>
          <p className="text-gray-700">{formatDate(user.last_login)}</p>
        </div>
      </div>
      {user.subscription && typeof user.subscription === "object" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Suscripción</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <strong>Plan:</strong> {user.subscription.plan}
            </li>
            <li>
              <strong>Inicio:</strong>{" "}
              {formatDate(user.subscription.created_at)}
            </li>
            <li>
              <strong>Renovación:</strong>{" "}
              {formatDate(user.subscription.renews_at)}
            </li>
            <li>
              <strong>Límite tráfico mensual:</strong>{" "}
              {user.subscription.traffic_limit.toLocaleString()} hits
            </li>
            <li>
              <strong>Dominios permitidos:</strong>{" "}
              {user.subscription.domain_limit}
            </li>
            <li>
              <strong>Usuarios permitidos:</strong>{" "}
              {user.subscription.user_limit}
            </li>
            <li>
              <strong>Precio:</strong> {user.subscription.price === 0 ? "Gratis" : `€${user.subscription.price}/mes`}
            </li>
          </ul>
          {/* Add this button section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium mb-3">Reporte Semanal</h4>
            <button
              onClick={handleForceSendReport}
              disabled={isSending}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isSending 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSending ? t('sending') : t('force_send_weekly_report')}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              {t('force_send_report_description')}
            </p>
          </div>
        </div>
        
      )}

      <SubscriptionSelector />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">{t("profile_info")}</h2>
        <div className="overflow-hidden bg-gray-50 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {Object.entries(user).map(([key, value]) => {
                if (typeof value === "object" && value !== null) return null;
                return (
                  <tr key={key}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {String(value) || t("not_available")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">{t("login_history")}</h2>
        {!accessHistory ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : accessHistory.length === 0 && !user.created_at ? (
          <p className="text-gray-500">{t("no_login_history")}</p>
        ) : (
          <ul className="space-y-4">
            {accessHistory.map((entry, index) => (
              <li
                key={index}
                className="border-l-4 pl-4 py-2 border-indigo-600"
              >
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(entry.timestamp)}
                </div>
                <div className="text-sm text-gray-500">
                  {entry.login_method} • {entry.ip_address}
                </div>
              </li>
            ))}
            {user.created_at && (
              <li className="border-l-4 pl-4 py-2 border-green-600">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(user.created_at)}
                </div>
                <div className="text-sm text-gray-500 italic">
                  {t("account_created")}
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
