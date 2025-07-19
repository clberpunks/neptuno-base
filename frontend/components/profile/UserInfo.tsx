// components/profile/UserInfo.tsx
// components/profile/UserInfo.tsx
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "react-toastify";
import { 
  FiCreditCard, 
  FiCalendar, 
  FiRefreshCw, 
  FiBarChart2, 
  FiGlobe, 
  FiUsers, 
  FiUser,
  FiCheckCircle
} from "react-icons/fi";
import DashboardCard from "../shared/DashboardCard";

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

  // Colores para la barra de progreso (optimizados para accesibilidad)
  const progressBarColor = trafficPercentage > 90 
    ? "bg-red-500" 
    : trafficPercentage > 75 
      ? "bg-amber-500" 
      : "bg-green-500";
  
  const progressTextColor = trafficPercentage > 90 
    ? "text-red-700" 
    : trafficPercentage > 75 
      ? "text-amber-700" 
      : "text-green-700";

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
      <div className="space-y-4">
        {/* Encabezado de usuario */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FiUser className="text-indigo-600 text-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 truncate" aria-label={t('user_name')}>
                  {user.name}
                </h1>
                <span 
                  className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full"
                  aria-label={t('user_role')}
                >
                  {user.role}
                </span>
              </div>
              <p 
                className="text-gray-600 text-sm truncate mt-1"
                aria-label={t('user_email')}
              >
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {user.created_at && (
              <div 
                className="bg-blue-50 rounded-lg p-2 flex items-center gap-2"
                aria-label={`${t('user_since')} ${shortFormatDate(user.created_at)}`}
              >
                <FiCalendar className="text-blue-500 text-sm" />
                <span className="text-blue-700 text-xs">
                  {t("user_since")} {shortFormatDate(user.created_at)}
                </span>
              </div>
            )}
            {user.last_login && (
              <div 
                className="bg-purple-50 rounded-lg p-2 flex items-center gap-2"
                aria-label={`${t('last_login_short')} ${shortFormatDate(user.last_login)}`}
              >
                <FiRefreshCw className="text-purple-500 text-sm" />
                <span className="text-purple-700 text-xs">
                  {t("last_login_short")} {shortFormatDate(user.last_login)}
                </span>
              </div>
            )}
            <div 
              className="bg-green-50 rounded-lg p-2 flex items-center gap-2"
              aria-label={t('account_status')}
            >
              <FiCheckCircle className="text-green-500 text-sm" />
              <span className="text-green-700 text-xs">
                {t("active")}
              </span>
            </div>
          </div>
        </div>

        {/* Sección de suscripción */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FiCreditCard className="text-indigo-600 text-lg" />
              </div>
              <h2 className="text-lg font-semibold" aria-label={t('subscription_plan')}>
                {subscription.plan}
              </h2>
            </div>
            
            <button
              onClick={handleForceSendReport}
              disabled={isSending}
              className={`px-3 py-1.5 rounded-md text-xs font-medium min-w-[120px] transition-colors ${
                isSending 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              aria-label={t('force_send_weekly_report')}
            >
              {isSending ? t('sending') : t('force_send_weekly_report')}
            </button>
          </div>

          {/* Estadísticas de suscripción usando DashboardCard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <DashboardCard 
              icon={<FiCreditCard className="text-indigo-600 text-base" />}
              value={subscription.price === 0 ? t("free") : `€${subscription.price}/${t("month")}`}
              label={t("plan_price")}
              color="bg-indigo-50 text-indigo-800"
              onClick={() => {}}
              ariaLabel={t("plan_price_tooltip")}
            />

            {subscription.created_at && (
              <DashboardCard 
                icon={<FiCalendar className="text-blue-600 text-base" />}
                value={shortFormatDate(subscription.created_at)}
                label={t("signup_date")}
                color="bg-blue-50 text-blue-800"
                onClick={() => {}}
                ariaLabel={t("signup_date_tooltip")}
              />
            )}

            {subscription.renews_at && (
              <DashboardCard 
                icon={<FiRefreshCw className="text-green-600 text-base" />}
                value={shortFormatDate(subscription.renews_at)}
                label={t("renewal_date")}
                color="bg-green-50 text-green-800"
                onClick={() => {}}
                ariaLabel={t("renewal_date_tooltip")}
              />
            )}

            <DashboardCard 
              icon={<FiBarChart2 className="text-purple-600 text-base" />}
              value={subscription.traffic_limit.toLocaleString()}
              label={t("hits_per_month")}
              color="bg-purple-50 text-purple-800"
              onClick={() => {}}
              ariaLabel={t("hits_limit_tooltip")}
            />

            <DashboardCard 
              icon={<FiGlobe className="text-pink-600 text-base" />}
              value={subscription.domain_limit}
              label={t("domains")}
              color="bg-pink-50 text-pink-800"
              onClick={() => {}}
              ariaLabel={t("domains_limit_tooltip")}
            />

            <DashboardCard 
              icon={<FiUsers className="text-amber-600 text-base" />}
              value={subscription.user_limit}
              label={t("users")}
              color="bg-amber-50 text-amber-800"
              onClick={() => {}}
              ariaLabel={t("users_limit_tooltip")}
            />
          </div>

          {/* Barra de progreso de uso de hits */}
          {subscription.traffic_used !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">
                  {t("usage")}: {subscription.traffic_used.toLocaleString()}/{subscription.traffic_limit.toLocaleString()} {t("hits")}
                </span>
                <span 
                  className={`text-xs font-medium ${progressTextColor}`}
                  aria-label={`${trafficPercentage}%`}
                >
                  {trafficPercentage}%
                </span>
              </div>
              <div 
                className="w-full bg-gray-200 rounded-full h-1.5"
                role="progressbar"
                aria-valuenow={trafficPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("traffic_usage")}
              >
                <div
                  className={`h-1.5 rounded-full ${progressBarColor}`}
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