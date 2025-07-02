// components/ReportsPanel.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../utils/api";
import SummaryReportPreview from "./SummaryReportPreview";
import SecurityReportPreview from "./SecurityReportPreview";
import SEOReportPreview from "./SEOReportPreview";
import FinancialReportPreview from "./FinancialReportPreview";

export default function ReportsPanel() {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, string>>({});
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [reportType, setReportType] = useState<"summary" | "security" | "seo" | "financial">("summary");
  
  const reportTypes = [
    { 
      id: "summary", 
      name: t("report_summary"), 
      icon: "DocumentChartBarIcon",
      color: "bg-indigo-100 text-indigo-800"
    },
    { 
      id: "security", 
      name: t("report_security"), 
      icon: "ShieldExclamationIcon",
      color: "bg-red-100 text-red-800"
    },
    { 
      id: "seo", 
      name: t("report_seo"), 
      icon: "MagnifyingGlassIcon",
      color: "bg-blue-100 text-blue-800"
    },
    { 
      id: "financial", 
      name: t("report_financial"), 
      icon: "CurrencyDollarIcon",
      color: "bg-green-100 text-green-800"
    }
  ];

  const timeRanges = [
    { id: "7d", name: t("last_7_days") },
    { id: "30d", name: t("last_30_days") },
    { id: "90d", name: t("last_90_days") }
  ];

  const generateReport = async () => {
    setLoading(prev => ({ ...prev, [reportType]: true }));
    setError(null);
    try {
      const data = await apiFetch<{ reportUrl: string }>(`/rest/reports/generate?type=${reportType}&range=${timeRange}`, {
        method: 'POST'
      });
      setReports(prev => ({ ...prev, [reportType]: data.reportUrl }));
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(t("report_generation_error"));
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const renderReportPreview = () => {
    const reportDate = new Date().toLocaleDateString();
    const timeRangeName = timeRanges.find(r => r.id === timeRange)?.name || "";
    const reportName = reportTypes.find(t => t.id === reportType)?.name || "";
    
    switch (reportType) {
      case "summary":
        return <SummaryReportPreview 
          reportDate={reportDate} 
          timeRangeName={timeRangeName}
          reportName={reportName}
        />;
      case "security":
        return <SecurityReportPreview 
          reportDate={reportDate} 
          timeRangeName={timeRangeName}
          reportName={reportName}
        />;
      case "seo":
        return <SEOReportPreview 
          reportDate={reportDate} 
          timeRangeName={timeRangeName}
          reportName={reportName}
        />;
      case "financial":
        return <FinancialReportPreview 
          reportDate={reportDate} 
          timeRangeName={timeRangeName}
          reportName={reportName}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 mb-6">
      <div 
        className="p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
            <DocumentChartBarIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("reports_title")}</h2>
            <p className="text-gray-600 mt-1">{t("reports_subtitle")}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label={isExpanded ? t("collapse") : t("expand")}
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6 transition-opacity duration-300">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Report Type Selector */}
            <div className="lg:col-span-1 bg-gray-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("report_type")}
              </h3>
              
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id as any)}
                    className={`w-full text-left p-3 rounded-md flex items-center space-x-3 transition-colors ${
                      reportType === type.id 
                        ? `${type.color} font-medium` 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${type.color}`}>
                      {/* Icon placeholder */}
                      <div className="h-5 w-5" />
                    </div>
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("time_range")}
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {timeRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setTimeRange(range.id as any)}
                      className={`p-2 rounded-md text-center text-sm ${
                        timeRange === range.id 
                          ? 'bg-indigo-100 text-indigo-800 font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={generateReport}
                  disabled={loading[reportType]}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading[reportType] ? (
                    <span>{t("generating")}...</span>
                  ) : (
                    <>
                      <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                      {t("generate_report")}
                    </>
                  )}
                </button>
                
                {reports[reportType] && (
                  <a 
                    href={reports[reportType]} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                    {t("download_report")}
                  </a>
                )}
              </div>
            </div>
            
            {/* Report Preview */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-lg p-5 h-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {reportTypes.find(t => t.id === reportType)?.name} {t("report_preview")}
                </h3>
                
                <div className="bg-white rounded-lg shadow-sm p-5">
                  {renderReportPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}