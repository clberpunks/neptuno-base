import { useTranslation } from "next-i18next";

interface PlanDistribution {
  free: number;
  pro: number;
  business: number;
  enterprise: number;
}

interface PlanDistributionProps {
  data: PlanDistribution;
}

export const PlanDistribution = ({ data }: PlanDistributionProps) => {
  const { t } = useTranslation("common");
  const totalUsers = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700">{t("plan_distribution")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(data).map(([plan, count]) => (
          <div key={plan} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h4 className="text-md font-medium capitalize text-gray-700">{t(plan)}</h4>
            <p className="text-2xl font-bold text-indigo-600">{count}</p>
            <p className="text-sm text-gray-500">
              {totalUsers > 0 ? `${Math.round((count / totalUsers) * 100)}% ${t("of_total")}` : '0%'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};