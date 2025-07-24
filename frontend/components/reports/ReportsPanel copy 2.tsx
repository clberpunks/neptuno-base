// components/reports/ReportsPanel.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";
import { apiFetch } from "../../utils/api";
import SummaryReportPreview from "./SummaryReportPreview";
import SecurityReportPreview from "./SecurityReportPreview";
import SEOReportPreview from "./SEOReportPreview";
import FinancialReportPreview from "./FinancialReportPreview";
import ExpandablePanel from "../shared/ExpandablePanel";
import CollapsiblePanel from "../shared/CollapsiblePanel";

export default function ReportsPanel() {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, string>>({});
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [activeReport, setActiveReport] = useState<"summary" | "security" | "seo" | "financial" | null>(null);
  
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

  const generateReport = async (reportType: "summary" | "security" | "seo" | "financial") => {
    setLoading(prev => ({ ...prev, [reportType]: true }));
    setError(null);
    try {
      const data = await apiFetch<{ reportUrl: string }>(
        `/rest/reports/generate?type=${reportType}&range=${timeRange}`, 
        { method: 'POST' }
      );
      setReports(prev => ({ ...prev, [reportType]: data.reportUrl }));
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(t("report_generation_error"));
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const renderReportPreview = (reportType: "summary" | "security" | "seo" | "financial") => {
    const reportDate = new Date().toLocaleDateString();
    const timeRangeName = timeRanges.find(r => r.id === timeRange)?.name || "";
    const reportName = reportTypes.find(t => t.id === reportType)?.name || "";
    
    const props = { reportDate, timeRangeName, reportName };
    
    switch (reportType) {
      case "summary": return <SummaryReportPreview {...props} />;
      case "security": return <SecurityReportPreview {...props} />;
      case "seo": return <SEOReportPreview {...props} />;
      case "financial": return <FinancialReportPreview {...props} />;
      default: return null;
    }
  };

  return (
    <ExpandablePanel
      id="reports-panel"
      title={t("reports_title")}
      description={t("reports_subtitle")}
      icon={<DocumentChartBarIcon className="h-6 w-6" />}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {/* Selector de rango de tiempo */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {t("time_range")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as any)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  timeRange === range.id 
                    ? 'bg-indigo-600 text-white font-medium' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Paneles de reportes */}
        {reportTypes.map((report) => (
          <CollapsiblePanel
            key={report.id}
            title={report.name}
            defaultExpanded={activeReport === report.id}
            loading={loading[report.id]}
            onToggle={() => setActiveReport(
              activeReport === report.id ? null : report.id as any
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                {renderReportPreview(report.id as any)}
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => generateReport(report.id as any)}
                  disabled={loading[report.id]}
                  className={`w-full flex items-center justify-center px-4 py-2.5 rounded-md transition-colors ${
                    loading[report.id] 
                      ? 'bg-gray-300 text-gray-500' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {loading[report.id] ? (
                    <span>{t("generating")}...</span>
                  ) : (
                    <>
                      <span>{t("generate_report")}</span>
                    </>
                  )}
                </button>
                
                {reports[report.id] && (
                  <a 
                    href={reports[report.id]} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {t("download_report")}
                  </a>
                )}
              </div>
            </div>
          </CollapsiblePanel>
        ))}
      </div>
    </ExpandablePanel>
  );
}