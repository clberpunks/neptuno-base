// components/shared/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  onClick: () => void;
  ariaLabel: string;
}

export default function DashboardCard({ 
  icon, 
  value, 
  label, 
  color, 
  onClick,
  ariaLabel
}: DashboardCardProps) {
  return (
    <div 
      className={`rounded-lg p-3 flex items-center cursor-pointer transition-all duration-200
                 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                 ${color}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
    >
      <div className={`p-2 rounded-full mr-3 ${color.split(' ')[0].replace('text-', 'bg-')}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-lg md:text-xl font-bold truncate">
          {value}
        </div>
        <div className="text-xs font-medium truncate">
          {label}
        </div>
      </div>
    </div>
  );
}