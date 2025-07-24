// frontend/components/admin/panels/SummarySection.tsx
import { useTranslation } from "next-i18next";

interface SummarySectionProps {
  totalUsers: number;
  churnedUsers: number;
  estimatedRevenue: number;
}

export const SummarySection = ({ 
  totalUsers, 
  churnedUsers, 
  estimatedRevenue 
}: SummarySectionProps) => {
  const { t } = useTranslation("common");
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700">{t("general_summary")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h4 className="text-md font-medium text-gray-700">{t("total_users")}</h4>
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h4 className="text-md font-medium text-gray-700">{t("retention_rate")}</h4>
          <p className="text-2xl font-bold text-gray-900">
            {totalUsers > 0 
              ? `${Math.round(((totalUsers - churnedUsers) / totalUsers) * 100)}%` 
              : '0%'}
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <h4 className="text-md font-medium text-gray-700">{t("value_per_user")}</h4>
          <p className="text-2xl font-bold text-gray-900">
            {totalUsers > 0 
              ? `$${(estimatedRevenue / totalUsers).toFixed(2)}` 
              : '$0.00'}
          </p>
        </div>
      </div>
    </div>
  );
};