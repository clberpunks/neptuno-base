// components/radar/TrackingCode.tsx
// components/radar/TrackingCode.tsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "next-i18next";

function useAutoResizeTextArea(value: string) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return textAreaRef;
}

export default function TrackingCodePanel() {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const [snippet, setSnippet] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const textAreaRef = useAutoResizeTextArea(snippet);

  const fetchSnippet = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/rest/embed/snippet.js", {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch snippet: ' + response.status);
      }
      
      const code = await response.text();
      setSnippet(code.trim());
      toast.success(t("code_generated_success"));
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error(t("error_generating_code"));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (user && !snippet) {
      fetchSnippet();
    }
  }, [user, snippet]);

  const copyToClipboard = () => {
    if (!snippet) return;
    
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info(t("code_copied"));
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("tracking_code")}</h3>
        <button
          onClick={fetchSnippet}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            isGenerating
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isGenerating ? t("generating") : t("generate_code")}
        </button> 
      </div>
      <div className="relative border rounded bg-gray-50 overflow-hidden">
        <textarea
          ref={textAreaRef}
          readOnly
          className="w-full p-4 font-mono text-sm bg-transparent border-0 resize-none"
          value={snippet}
          style={{ overflow: "hidden" }}
          rows={1}
          aria-label={t("tracking_code")}
        />
        <button
          onClick={copyToClipboard}
          disabled={!snippet || isGenerating}
          className={`absolute top-3 right-3 px-3 py-1 rounded text-sm transition ${
            copied
              ? "bg-green-500 text-white"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
          aria-label={t("copy_code_to_clipboard")}
        >
          {copied ? t("copied_short") : t("copy")}
        </button>
      </div>
    </div>
  );
}