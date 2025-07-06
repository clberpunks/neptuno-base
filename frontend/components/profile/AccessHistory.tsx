// components/AccessHistory.tsx
import { useTranslation } from "next-i18next";

interface AccessHistoryProps {
  accessHistory?: Array<{
    timestamp: string;
    login_method: string;
    ip_address: string;
  }>;
  formatDate: (dateString?: string) => string;
  user: {
    created_at?: string;
  };
}

export default function AccessHistory({
  accessHistory,
  formatDate,
  user,
}: AccessHistoryProps) {
  const { t } = useTranslation("common");

  return (
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
  );
}