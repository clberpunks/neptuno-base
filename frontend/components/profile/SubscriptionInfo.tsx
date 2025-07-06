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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="subscription-details-section"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Suscripción: {subscription.plan}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                {subscription.price === 0 ? "Gratis" : `€${subscription.price}/mes`}
              </div>
              {subscription.traffic_used && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Usado: {trafficPercentage}%
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleForceSendReport();
              }}
              disabled={isSending}
              className={`px-4 py-2 rounded-md text-sm font-medium min-w-[180px] ${
                isSending 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              aria-label={t('force_send_weekly_report')}
            >
              {isSending ? t('sending') : t('force_send_weekly_report')}
            </button>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      <div
        id="subscription-details-section"
        className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Plan:</strong> {subscription.plan}</p>
            <p><strong>Inicio:</strong> {formatDate(subscription.created_at)}</p>
            <p><strong>Renovación:</strong> {formatDate(subscription.renews_at)}</p>
          </div>
          <div>
            <p><strong>Límite tráfico:</strong> {subscription.traffic_limit.toLocaleString()} hits</p>
            <p><strong>Dominios permitidos:</strong> {subscription.domain_limit}</p>
            <p><strong>Usuarios permitidos:</strong> {subscription.user_limit}</p>
          </div>
        </div>
        {subscription.traffic_used && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Uso de tráfico</span>
              <span>{subscription.traffic_used.toLocaleString()} / {subscription.traffic_limit.toLocaleString()} hits</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
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
      </div>
    </div>
  );
}