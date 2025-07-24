// frontend/components/admin/panels/UserActivityPanel.tsx
import { MetricCard } from './MetricCard';
import { useTranslation } from "next-i18next";

interface TopUser {
  id: string;
  name: string;
  email: string;
  request_count: number;
  last_activity: string;
  plan: string;
}

interface UserActivityPanelProps {
  topUsers: TopUser[];
}

export const UserActivityPanel = ({ topUsers }: UserActivityPanelProps) => {
  const { t } = useTranslation("common");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t("active_users")} 
          value={topUsers.length} 
          description={t("users_with_most_activity")} 
          color="bg-blue-50"
        />
        
        <MetricCard 
          title={t("total_requests")} 
          value={topUsers.reduce((sum, user) => sum + user.request_count, 0)} 
          description={t("from_most_active_users")} 
        />
        
        <MetricCard 
          title={t("top_user")} 
          value={topUsers[0]?.name || 'N/A'} 
          description={`${topUsers[0]?.request_count || 0} ${t("requests")}`} 
          color="bg-green-50"
        />
        
        <MetricCard 
          title={t("most_used_plan")} 
          value={(() => {
            const planCounts: Record<string, number> = {};
            topUsers.forEach(user => {
              planCounts[user.plan] = (planCounts[user.plan] || 0) + 1;
            });
            return Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
          })()} 
          description={t("among_active_users")} 
          color="bg-purple-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">{t("top_users_by_activity")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("user")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("plan")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("requests")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("last_activity")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      user.plan === 'business' ? 'bg-blue-100 text-blue-800' :
                      user.plan === 'pro' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.request_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.last_activity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};