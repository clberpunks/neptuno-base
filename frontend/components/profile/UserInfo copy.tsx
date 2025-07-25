// components/profile/UserInfo.tsx
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiCreditCard, FiCalendar, FiRefreshCw, FiBarChart2, FiGlobe, FiUsers, FiInfo } from "react-icons/fi";

interface UserInfoProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at?: string;
    last_login?: string;
  };
  subscription: {
    plan: string;
    created_at?: string;
    renews_at?: string;
    traffic_limit: number;
    domain_limit: number;
    user_limit: number;
    price: number;
    traffic_used?: number;
  };
  formatDate: (dateString?: string) => string;
}

export default function UserInfo({ user, subscription, formatDate }: UserInfoProps) {
  const { t } = useTranslation("common");
  const [isSending, setIsSending] = useState(false);

  const handleForceSendReport = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/rest/user/send-weekly-report', {
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

  const trafficPercentage = subscription.traffic_used 
    ? Math.min(100, Math.round((subscription.traffic_used / subscription.traffic_limit) * 100))
    : 0;

  const shortFormatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-4 w-full md:w-auto">
            {/* <Image
              src={`https://www.gravatar.com/avatar/${
                user?.email
                  ? require("crypto")
                      .createHash("md5")
                      .update(user.email.trim().toLowerCase())
                      .digest("hex")
                  : ""
              }?d=mp&s=40`}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full w-10 h-10 flex-shrink-0 mt-1"
              unoptimized={process.env.NODE_ENV === "development"}
            /> */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 truncate">{user.name}</h1>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600 text-sm truncate">{user.email}</p>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  {t("active")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
            {user.created_at && (
              <div className="bg-blue-50 rounded-lg p-2 flex items-center gap-2">
                <FiCalendar className="text-blue-500 text-sm" />
                <span className="text-blue-700 text-xs">
                  {t("user_since")} {shortFormatDate(user.created_at)}
                </span>
              </div>
            )}
            {user.last_login && (
              <div className="bg-purple-50 rounded-lg p-2 flex items-center gap-2">
                <FiRefreshCw className="text-purple-500 text-sm" />
                <span className="text-purple-700 text-xs">
                  {t("last_login_short")} {shortFormatDate(user.last_login)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FiCreditCard className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold">{subscription.plan}</h3>
            </div>
            
            <button
              onClick={handleForceSendReport}
              disabled={isSending}
              className={`px-3 py-1.5 rounded-md text-xs font-medium min-w-[120px] ${
                isSending 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSending ? t('sending') : t('force_send_weekly_report')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-indigo-50 rounded-lg p-3 flex flex-col">
              <div className="flex items-center gap-1 text-indigo-600">
                <span className="font-medium">
                  {subscription.price === 0 ? "Gratis" : `€${subscription.price}/mes`}
                </span>
                <div className="group relative">
                  <FiInfo size={14} />
                  <span className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-32 text-xs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Precio del plan
                  </span>
                </div>
              </div>
              <span className="text-xs text-indigo-400">Plan</span>
            </div>

            {subscription.created_at && (
              <div className="bg-blue-50 rounded-lg p-3 flex flex-col">
                <div className="flex items-center gap-1 text-blue-600">
                  <FiCalendar size={14} />
                  <span className="font-medium">
                    {shortFormatDate(subscription.created_at)}
                  </span>
                  <div className="group relative">
                    <FiInfo size={14} />
                    <span className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-32 text-xs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Fecha de alta
                    </span>
                  </div>
                </div>
                <span className="text-xs text-blue-400">Alta</span>
              </div>
            )}

            {subscription.renews_at && (
              <div className="bg-green-50 rounded-lg p-3 flex flex-col">
                <div className="flex items-center gap-1 text-green-600">
                  <FiRefreshCw size={14} />
                  <span className="font-medium">
                    {shortFormatDate(subscription.renews_at)}
                  </span>
                  <div className="group relative">
                    <FiInfo size={14} />
                    <span className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-32 text-xs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Próxima renovación
                    </span>
                  </div>
                </div>
                <span className="text-xs text-green-400">Renueva</span>
              </div>
            )}

            <div className="bg-purple-50 rounded-lg p-3 flex flex-col">
              <div className="flex items-center gap-1 text-purple-600">
                <FiBarChart2 size={14} />
                <span className="font-medium">
                  {subscription.traffic_limit.toLocaleString()}
                </span>
                <div className="group relative">
                  <FiInfo size={14} />
                  <span className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-32 text-xs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Límite mensual de hits
                  </span>
                </div>
              </div>
              <span className="text-xs text-purple-400">Hits/mes</span>
            </div>

            <div className="bg-pink-50 rounded-lg p-3 flex flex-col">
              <div className="flex items-center gap-1 text-pink-600">
                <FiGlobe size={14} />
                <span className="font-medium">
                  {subscription.domain_limit}
                </span>
                <div className="group relative">
                  <FiInfo size={14} />
                  <span className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-32 text-xs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Dominios permitidos
                  </span>
                </div>
              </div>
              <span className="text-xs text-pink-400">Dominios</span>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 flex flex-col">
              <div className="flex items-center gap-1 text-amber-600">
                <FiUsers size={14} />
                <span className="font-medium">
                  {subscription.user_limit}
                </span>
                <div className="group relative">
                  <FiInfo size={14} />
                  <span className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-32 text-xs bg-gray-800 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Usuarios permitidos
                  </span>
                </div>
              </div>
              <span className="text-xs text-amber-400">Usuarios</span>
            </div>
          </div>

          {subscription.traffic_used && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">
                  Uso: {subscription.traffic_used.toLocaleString()}/{subscription.traffic_limit.toLocaleString()} hits
                </span>
                <span className={`text-xs font-medium ${
                  trafficPercentage > 90 ? 'text-red-600' : 
                  trafficPercentage > 75 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {trafficPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    trafficPercentage > 90 ? 'bg-red-500' : 
                    trafficPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${trafficPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}