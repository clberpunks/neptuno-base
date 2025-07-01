// components/reports/SecurityReportPreview.tsx
import { useTranslation } from "next-i18next";

interface SecurityReportPreviewProps {
  reportDate: string;
  timeRangeName: string;
  reportName: string;
}

export default function SecurityReportPreview({ 
  reportDate,
  timeRangeName,
  reportName
}: SecurityReportPreviewProps) {
  const { t } = useTranslation("common");

  const securityMetrics = [
    { id: "malicious_bots", name: t("malicious_bots") },
    { id: "blocked_requests", name: t("blocked_requests") },
    { id: "scrapers", name: t("scrapers") },
    { id: "botnets", name: t("botnets") },
    { id: "blacklisted", name: t("blacklisted") }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityMetrics.map((metric, index) => (
            <div key={metric.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                  <p className="text-2xl font-bold mt-1">
                    {index === 0 ? "1,245" : 
                     index === 1 ? "24,567" : 
                     index === 2 ? "8,342" : 
                     index === 3 ? "456" : "3,214"}
                  </p>
                </div>
                <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {index === 0 ? "+24%" : 
                   index === 1 ? "+12%" : 
                   index === 2 ? "+5%" : 
                   index === 3 ? "-8%" : "+17%"}
                </div>
              </div>
              <div className="mt-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${index === 0 ? 80 : index === 1 ? 65 : index === 2 ? 45 : index === 3 ? 30 : 75}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">{t("security_recommendations")}</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="h-2 w-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
              {t("security_rec_1")}
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
              {t("security_rec_2")}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}