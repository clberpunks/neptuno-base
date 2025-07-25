// frontend/components/MetaSEO.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { Rule } from "./FirewallManager";
import ExpandablePanel from "../shared/ExpandablePanel";

interface MetaSEOProps {
  rules: Rule[];
}

export default function MetaSEO({ rules }: MetaSEOProps) {
  const { t } = useTranslation("common");
  const [metaContent, setMetaContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const generateMetaTags = () => {
    let content = "";
    rules.forEach((rule) => {
      if (rule.policy === "block") {
        content += `<meta name="robots" content="noindex, nofollow" data-pattern="${rule.pattern}" />\n`;
      } else if (rule.policy === "allow") {
        content += `<meta name="robots" content="index, follow" data-pattern="${rule.pattern}" />\n`;
      } else if (rule.policy === "restricted") {
        content += `<meta name="robots" content="index, nofollow" data-pattern="${rule.pattern}" />\n`;
      }
    });
    setMetaContent(content);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(metaContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <ExpandablePanel
      title={t("meta_seo")}
      description={t("meta_seo_description")}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      }
      statusLabel={t("recommended")}
      statusColor="bg-purple-100 text-purple-800"
      defaultExpanded={true}
    >
      <div className="space-y-4">
        <button
          onClick={generateMetaTags}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-300"
        >
          {t("generate_meta")}
        </button>

        {metaContent && (
          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {t("meta_content")}
              </span>
              <button
                onClick={copyToClipboard}
                className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  isCopied
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {isCopied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    {t("copy_to_clipboard")}
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={metaContent}
              className="w-full h-48 p-4 font-mono text-sm bg-white"
            />
          </div>
        )}
      </div>
    </ExpandablePanel>
  );
}
