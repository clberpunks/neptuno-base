// components/reports/ReportsPanel.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { 
  DocumentChartBarIcon, 
  ShieldExclamationIcon, 
  MagnifyingGlassIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../utils/api";
import SummaryReportPreview from "./SummaryReportPreview";
import SecurityReportPreview from "./SecurityReportPreview";
import SEOReportPreview from "./SEOReportPreview";
import FinancialReportPreview from "./FinancialReportPreview";
import CollapsiblePanel from "../shared/CollapsiblePanel";

interface ReportPanelProps {
  type: "summary" | "security" | "seo" | "financial";
  name: string;
  icon: React.ReactNode;
  color: string;
}

function ReportPanel({ type, name, icon, color }: ReportPanelProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  
  const timeRanges = [
    { id: "7d", name: t("last_7_days") },
    { id: "30d", name: t("last_30_days") },
    { id: "90d", name: t("last_90_days") }
  ];

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ reportUrl: string }>(
        `/rest/reports/generate?type=${type}&range=${timeRange}`, 
        { method: 'POST' }
      );
      setReportUrl(data.reportUrl);
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(t("report_generation_error"));
    } finally {
      setLoading(false);
    }
  };

  const renderReportPreview = () => {
    const reportDate = new Date().toLocaleDateString();
    const timeRangeName = timeRanges.find(r => r.id === timeRange)?.name || "";
    
    const props = { reportDate, timeRangeName, reportName: name };
    
    switch (type) {
      case "summary": return <SummaryReportPreview {...props} />;
      case "security": return <SecurityReportPreview {...props} />;
      case "seo": return <SEOReportPreview {...props} />;
      case "financial": return <FinancialReportPreview {...props} />;
      default: return null;
    }
  };

  return (
    <CollapsiblePanel
      title={
        <div className="flex items-center">
          <div className={`p-2 rounded-md ${color}`}>
            {icon}
          </div>
          <span className="ml-2">{name}</span>
        </div>
      }
      defaultExpanded={false}
      loading={loading}
      onToggle={() => setIsExpanded(!isExpanded)}
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
        
        {/* Previsualización del informe */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {renderReportPreview()}
        </div>
        
        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={generateReport}
            disabled={loading}
            className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-md transition-colors ${
              loading 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? t("generating") + "..." : t("generate_report")}
          </button>
          
          {reportUrl && (
            <a 
              href={reportUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {t("download_report")}
            </a>
          )}
        </div>
      </div>
    </CollapsiblePanel>
  );
}

export default function ReportsPanel() {
  const { t } = useTranslation("common");
  
  const reportTypes = [
    { 
      id: "summary", 
      name: t("report_summary"), 
      icon: <DocumentChartBarIcon className="h-5 w-5" />,
      color: "bg-indigo-100 text-indigo-800"
    },
    { 
      id: "security", 
      name: t("report_security"), 
      icon: <ShieldExclamationIcon className="h-5 w-5" />,
      color: "bg-red-100 text-red-800"
    },
    { 
      id: "seo", 
      name: t("report_seo"), 
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800"
    },
    { 
      id: "financial", 
      name: t("report_financial"), 
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      color: "bg-green-100 text-green-800"
    }
  ];

  return (
    <div className="space-y-6">
      {reportTypes.map((report) => (
        <ReportPanel
          key={report.id}
          type={report.id as any}
          name={report.name}
          icon={report.icon}
          color={report.color}
        />
      ))}
    </div>
  );
}