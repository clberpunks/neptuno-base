// components/ProfileSection.tsx
import { useTranslation } from "next-i18next";
import UserInfoCard from "./UserInfoCard";
import SubscriptionInfo from "./SubscriptionInfo";
import SubscriptionSelector from "./SuscriptionSelector";
import AccessHistory from "./AccessHistory";
import { useState } from "react";

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at?: string;
    last_login?: string;
    subscription?: {
      plan: string;
      created_at?: string;
      renews_at?: string;
      traffic_limit: number;
      domain_limit: number;
      user_limit: number;
      price: number;
      traffic_used?: number;
    };
    [key: string]: any;
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
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  return (
    <div className="space-y-6">
      <UserInfoCard user={user} formatDate={formatDate} />

      {user.subscription && typeof user.subscription === "object" && (
        <>
          <SubscriptionInfo 
            subscription={user.subscription} 
            formatDate={formatDate} 
          />
          <SubscriptionSelector />
        </>
      )}


      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          aria-expanded={isHistoryExpanded}
          aria-controls="history-section"
        >
          <h2 className="text-xl font-semibold flex items-center justify-between">
            {t("login_history")}
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                isHistoryExpanded ? "rotate-180" : ""
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
          </h2>
        </button>

        <div
          id="history-section"
          className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
            isHistoryExpanded ? "block" : "hidden"
          }`}
        >
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
          aria-expanded={isProfileExpanded}
          aria-controls="profile-info-section"
        >
          <h2 className="text-xl font-semibold flex items-center justify-between">
            {t("profile_info")}
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                isProfileExpanded ? "rotate-180" : ""
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
          </h2>
        </button>

        <div
          id="profile-info-section"
          className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
            isProfileExpanded ? "block" : "hidden"
          }`}
        >
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
      </div>


    </div>
  );
}