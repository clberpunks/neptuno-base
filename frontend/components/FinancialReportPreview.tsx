// components/reports/FinancialReportPreview.tsx
import { useTranslation } from "next-i18next";

interface FinancialReportPreviewProps {
  reportDate: string;
  timeRangeName: string;
  reportName: string;
}

export default function FinancialReportPreview({ 
  reportDate,
  timeRangeName,
  reportName
}: FinancialReportPreviewProps) {
  const { t } = useTranslation("common");

  const financialMetrics = [
    { id: "usage_costs", name: t("usage_costs") },
    { id: "demand_costs", name: t("demand_costs") },
    { id: "monetization", name: t("monetization") },
    { id: "ai_tariffs", name: t("ai_tariffs") },
    { id: "revenue", name: t("revenue") }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-900">
            {t("report_for")} {timeRangeName}
          </h4>
          <p className="text-gray-600">{reportDate}</p>
        </div>
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financialMetrics.map((metric, index) => (
            <div key={metric.id} className={`border-l-4 ${
              index === 0 ? "border-indigo-500" : 
              index === 1 ? "border-blue-500" : 
              index === 2 ? "border-green-500" : 
              index === 3 ? "border-yellow-500" : "border-purple-500"
            } p-4 bg-white rounded-r-lg shadow-sm`}>
              <p className="text-sm font-medium text-gray-900">{metric.name}</p>
              <p className="text-2xl font-bold mt-1">
                {index === 0 ? "$1,245" : 
                 index === 1 ? "$2,567" : 
                 index === 2 ? "$3,214" : 
                 index === 3 ? "$845" : "$4,567"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {index === 0 ? t("infrastructure") : 
                 index === 1 ? t("ai_requests") : 
                 index === 2 ? t("ad_revenue") : 
                 index === 3 ? t("api_fees") : t("total")}
              </p>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">{t("financial_insights")}</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
              {t("finance_insight_1")}
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></div>
              {t("finance_insight_2")}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}