// components/SubscriptionInfo.tsx
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "react-toastify";

interface SubscriptionInfoProps {
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

export default function SubscriptionInfo({ subscription, formatDate }: SubscriptionInfoProps) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">Suscripción: {subscription.plan}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {subscription.price === 0 ? "Gratis" : `€${subscription.price}/mes`}
            </span>
            {subscription.created_at && (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Inicio: {formatDate(subscription.created_at)}
              </span>
            )}
            {subscription.renews_at && (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Renovación: {formatDate(subscription.renews_at)}
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Tráfico: {subscription.traffic_limit.toLocaleString()} hits
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Dominios: {subscription.domain_limit}
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Usuarios: {subscription.user_limit}
            </span>
            {subscription.traffic_used && (
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center ${
                trafficPercentage > 90 ? 'bg-red-100 text-red-800' : 
                trafficPercentage > 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                <span className={`h-2 w-2 rounded-full mr-1.5 ${
                  trafficPercentage > 90 ? 'bg-red-500' : 
                  trafficPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                Tráfico usado: {trafficPercentage}%
              </span>
            )}
          </div>
        </div>
        {subscription.traffic_used && (
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="flex justify-between text-xs mb-1">
              <span>{subscription.traffic_used.toLocaleString()}/{subscription.traffic_limit.toLocaleString()}</span>
              <span>{trafficPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  trafficPercentage > 90 ? 'bg-red-500' : 
                  trafficPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${trafficPercentage}%` }}
                role="progressbar"
                aria-valuenow={trafficPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        )}
        <button
          onClick={handleForceSendReport}
          disabled={isSending}
          className={`px-3 py-1.5 rounded-md text-xs font-medium min-w-[120px] flex-shrink-0 ${
            isSending 
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          aria-label={t('force_send_weekly_report')}
        >
          {isSending ? t('sending') : t('force_send_weekly_report')}
        </button>
      </div>
    </div>
  );
}