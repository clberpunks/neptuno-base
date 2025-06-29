// components/SummarySection.tsx
import Image from "next/image";
import { useTranslation } from "next-i18next";
import RiskPanel from "./RiskPanel";
import TrackingCodePanel from "./TrackingCode";

interface SummarySectionProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at?: string;
    last_login?: string;
  };
  formatDate: (dateString?: string) => string;
}

export default function SummarySection({ user, formatDate }: SummarySectionProps) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-8">
      <RiskPanel />
      <TrackingCodePanel />
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
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name}
            </h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {user.role}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {t("account_status")}
          </h3>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-700">{t("active")}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {t("created_at")}
          </h3>
          <p className="text-gray-700">{formatDate(user.created_at)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {t("last_login")}
          </h3>
          <p className="text-gray-700">{formatDate(user.last_login)}</p>
        </div>
      </div>
    </div>
  );
}