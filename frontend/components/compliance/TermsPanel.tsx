// components/TermsPanel.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  DocumentTextIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../utils/api";

export default function TermsPanel() {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, string>>({});
  
  const documentTypes = [
    { id: "terms", name: t("terms_conditions"), icon: <DocumentTextIcon className="h-5 w-5" /> },
    { id: "privacy", name: t("privacy_policy"), icon: <LockClosedIcon className="h-5 w-5" /> },
    { id: "ai_policy", name: t("ai_use_policy"), icon: <ExclamationTriangleIcon className="h-5 w-5" /> }
  ];

  const generateDocument = async (docType: string) => {
    setLoading(prev => ({ ...prev, [docType]: true }));
    setError(null);
    
    try {
      const response = await apiFetch(`/rest/terms/generate?type=${docType}`, {
        method: 'POST'
      }) as Response;
      
      const data = await response.json();
      setDocuments(prev => ({ ...prev, [docType]: data.documentUrl }));
      
    } catch (err) {
      console.error("Failed to generate document:", err);
      setError(t("terms_generation_error"));
    } finally {
      setLoading(prev => ({ ...prev, [docType]: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 mb-6">
      <div 
        className="p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-green-100 text-green-800">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("terms_title")}</h2>
            <p className="text-gray-600 mt-1">{t("terms_subtitle")}</p>
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
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            {documentTypes.map((docType) => (
              <div 
                key={docType.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-1.5 rounded-md bg-gray-100 text-gray-600">
                    {docType.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {docType.name}
                  </h3>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => generateDocument(docType.id)}
                    disabled={loading[docType.id]}
                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
                  >
                    {loading[docType.id] ? (
                      <span>{t("generating")}...</span>
                    ) : (
                      <>
                        <DocumentTextIcon className="mr-2 h-4 w-4" />
                        {t("generate_document")}
                      </>
                    )}
                  </button>
                  
                  {documents[docType.id] && (
                    <a 
                      href={documents[docType.id]} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      <DocumentTextIcon className="mr-2 h-4 w-4" />
                      {t("download_document")}
                    </a>
                  )}
                </div>
                
                {docType.id === "ai_policy" && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      {t("ai_policy_clause")}
                    </p>
                    <code className="block mt-2 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
                      {t("ai_policy_example")}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-700 flex-shrink-0" />
              <p className="ml-3 text-sm text-yellow-700">
                {t("terms_warning")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}