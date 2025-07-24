// frontend/components/shared/ExpandablePanel.tsx
import { useState, ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ExpandablePanelProps {
  id?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  statusLabel?: string;
  statusColor?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  loading?: boolean;
  error?: string;
  ariaLabel?: string;
}

export default function ExpandablePanel({
  id,
  title,
  description,
  icon,
  statusLabel,
  statusColor = 'bg-gray-100 text-gray-800',
  children,
  defaultExpanded = true,
  loading = false,
  error,
}: ExpandablePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        id={id}
        className="p-6 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        // aria-label={ariaLabel}
        aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
      >
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="p-2 rounded-lg bg-gray-100 text-gray-800">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {statusLabel && (
            <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          )}
          <button
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
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
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}