// components/shared/CollapsiblePanel.tsx
import { useState } from "react";

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  loading?: boolean;
}

export default function CollapsiblePanel({
  title,
  children,
  defaultExpanded = false,
  loading = false
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <button
        className="w-full p-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        disabled={loading}
      >
        <h3 className="font-semibold">
          {title}
          {loading && <span className="ml-2 text-gray-500 text-sm">(cargando...)</span>}
        </h3>
        {!loading && (
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}