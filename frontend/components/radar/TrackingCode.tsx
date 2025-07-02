import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";

// Hook para ajustar automáticamente la altura del textarea
function useAutoResizeTextArea(value: string) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // Resetear altura para obtener el cálculo correcto
      textAreaRef.current.style.height = "auto";
      // Ajustar altura al contenido (scrollHeight)
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return textAreaRef;
}

export default function TrackingCodePanel() {
  const { user, loading } = useAuth();
  const [snippet, setSnippet] = useState("");
  const [copied, setCopied] = useState(false);
  const textAreaRef = useAutoResizeTextArea(snippet);

  useEffect(() => {
    if (!loading && user) {
      fetch("/_backend/embed/snippet.js", {
        credentials: "include"
      })
        .then(res => res.text())
        .then(code => {
          const fullScript = `\n${code.trim()}\n`;
          setSnippet(fullScript);
        });
    }
  }, [user, loading]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user || !snippet) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Código de Seguimiento</h3>
      <p className="text-gray-600 mb-3">
        Copia y pega este <code className="bg-gray-100 px-1 py-0.5 rounded">&lt;script&gt;</code> completo en tu sitio web.
      </p>
      
      <div className="relative border rounded bg-gray-50 overflow-hidden">
        <textarea
          ref={textAreaRef}
          readOnly
          className="w-full p-4 font-mono text-sm bg-transparent border-0 resize-none"
          value={snippet}
          style={{ overflow: "hidden" }}
          rows={1}
        />
        <button
          onClick={copyToClipboard}
          className={`absolute top-3 right-3 px-3 py-1 rounded text-sm transition ${
            copied 
              ? "bg-green-500 text-white" 
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        El código se ajusta automáticamente y no muestra barras de scroll
      </div>
    </div>
  );
}