// frontend/components/TrackingCodePanel.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function TrackingCodePanel() {
  const { user, loading } = useAuth();
  const [snippet, setSnippet] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Cargar el JS generado dinámicamente desde el backend
      fetch("/embed/snippet.js", {
        credentials: "include"
      })
        .then(res => res.text())
        .then(code => {
          const fullScript = `<script>\n${code.trim()}\n</script>`;
          setSnippet(fullScript);
        });
    }
  }, [user, loading]);

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user || !snippet) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Código de Seguimiento</h3>
      <p className="text-gray-600 mb-3">
        Copia y pega este <code>&lt;script&gt;</code> completo en tu sitio web.
      </p>
      <div className="relative">
        <textarea
          readOnly
          className="w-full p-2 border rounded font-mono text-sm resize-none h-48 bg-gray-50"
          value={snippet}
        />
        <button
          onClick={copy}
          className="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
