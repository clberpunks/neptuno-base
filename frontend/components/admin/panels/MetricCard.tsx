// frontend/components/admin/panels/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  color?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  description, 
  color = "bg-white"
}: MetricCardProps) => (
  <div className={`${color} rounded-xl shadow-md p-6 transition-all hover:shadow-lg`}>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    {description && (
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    )}
  </div>
);