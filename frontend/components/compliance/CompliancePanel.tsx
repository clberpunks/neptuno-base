// components/CompliancePanel.tsx
// components/CompliancePanel.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { 
  DocumentTextIcon,
  GlobeEuropeAfricaIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../utils/api";
import ExpandablePanel from "../shared/ExpandablePanel";

export default function CompliancePanel() {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, string>>({});
  
  const complianceFrameworks = [
    { id: "gdpr", name: t("compliance_gdpr"), icon: <GlobeEuropeAfricaIcon className="h-5 w-5" /> },
    { id: "ccpa", name: t("compliance_ccpa"), icon: <ShieldCheckIcon className="h-5 w-5" /> },
    { id: "iso42001", name: t("compliance_iso42001"), icon: <DocumentTextIcon className="h-5 w-5" /> },
    { id: "nist", name: t("compliance_nist"), icon: <ShieldCheckIcon className="h-5 w-5" /> }
  ];

  const generateDocument = async (framework: string) => {
    setLoading(prev => ({ ...prev, [framework]: true }));
    setError(null);
    
    try {
      const response = await apiFetch(`/rest/compliance/generate?framework=${framework}`, {
        method: 'POST'
      }) as Response;
      
      const data = await response.json();
      setDocuments(prev => ({ ...prev, [framework]: data.documentUrl }));
      
    } catch (err) {
      console.error("Failed to generate document:", err);
      setError(t("compliance_generation_error"));
    } finally {
      setLoading(prev => ({ ...prev, [framework]: false }));
    }
  };

  return (
    <ExpandablePanel
      title={t("compliance_title")}
      description={t("compliance_subtitle")}
      icon={<DocumentTextIcon className="h-6 w-6" />}
      statusLabel={t("ai_governance")}
      statusColor="bg-blue-100 text-blue-800"
      defaultExpanded={false}
    >
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complianceFrameworks.map((framework) => (
          <div 
            key={framework.id}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-1.5 rounded-md bg-gray-100 text-gray-600">
                {framework.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {framework.name}
              </h3>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => generateDocument(framework.id)}
                disabled={loading[framework.id]}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
              >
                {loading[framework.id] ? (
                  <span>{t("generating")}...</span>
                ) : (
                  <>
                    <DocumentTextIcon className="mr-2 h-4 w-4" />
                    {t("generate_document")}
                  </>
                )}
              </button>
              
              {documents[framework.id] && (
                <a 
                  href={documents[framework.id]} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                >
                  <DocumentTextIcon className="mr-2 h-4 w-4" />
                  {t("download_document")}
                </a>
              )}
            </div>
            
            {framework.id === "gdpr" && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">{t("gdpr_description")}</p>
              </div>
            )}
            
            {framework.id === "ccpa" && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">{t("ccpa_description")}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex">
          <ShieldCheckIcon className="h-5 w-5 text-yellow-700 flex-shrink-0" />
          <p className="ml-3 text-sm text-yellow-700">
            {t("compliance_warning")}
          </p>
        </div>
      </div>
    </ExpandablePanel>
  );
}