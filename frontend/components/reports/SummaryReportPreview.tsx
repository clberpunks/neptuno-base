// components/reports/SummaryReportPreview.tsx
import { useTranslation } from "next-i18next";

interface SummaryReportPreviewProps {
  reportDate: string;
  timeRangeName: string;
  reportName: string;
}

export default function SummaryReportPreview({ 
  reportDate,
  timeRangeName,
  reportName
}: SummaryReportPreviewProps) {
  const { t } = useTranslation("common");

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
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-700">{t("security_overview")}</p>
            <p className="text-2xl font-bold mt-1">87%</p>
            <p className="text-xs text-gray-500 mt-1">{t("threats_blocked")}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">{t("seo_performance")}</p>
            <p className="text-2xl font-bold mt-1">24%</p>
            <p className="text-xs text-gray-500 mt-1">{t("traffic_increase")}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">{t("revenue")}</p>
            <p className="text-2xl font-bold mt-1">$1,245</p>
            <p className="text-xs text-gray-500 mt-1">{t("from_ai_traffic")}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">{t("key_insights")}</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="h-2 w-2 bg-indigo-500 rounded-full mt-1.5 mr-2"></div>
              {t("security_insight")}
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
              {t("seo_insight")}
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
              {t("financial_insight")}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}