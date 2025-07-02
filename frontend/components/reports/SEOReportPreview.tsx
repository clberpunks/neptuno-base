// components/reports/SEOReportPreview.tsx
import { useTranslation } from "next-i18next";

interface SEOReportPreviewProps {
  reportDate: string;
  timeRangeName: string;
  reportName: string;
}

export default function SEOReportPreview({ 
  reportDate,
  timeRangeName,
  reportName
}: SEOReportPreviewProps) {
  const { t } = useTranslation("common");

  const seoMetrics = [
    { id: "crawlers", name: t("crawlers") },
    { id: "ai_agents", name: t("ai_agents") },
    { id: "scrapers", name: t("scrapers") },
    { id: "llm_referrals", name: t("llm_referrals") },
    { id: "chatbot_traffic", name: t("chatbot_traffic") }
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("source")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("traffic")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("change")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("engagement")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seoMetrics.map((metric, index) => (
                <tr key={metric.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {index === 0 ? "24,567" : 
                     index === 1 ? "8,342" : 
                     index === 2 ? "1,245" : 
                     index === 3 ? "5,678" : "3,214"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      index === 0 || index === 4 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {index === 0 ? "+12%" : 
                       index === 1 ? "-5%" : 
                       index === 2 ? "+24%" : 
                       index === 3 ? "-2%" : "+8%"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {index === 0 ? "2:45" : 
                     index === 1 ? "1:32" : 
                     index === 2 ? "0:45" : 
                     index === 3 ? "3:12" : "2:18"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">{t("seo_recommendations")}</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
              {t("seo_rec_1")}
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
              {t("seo_rec_2")}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}