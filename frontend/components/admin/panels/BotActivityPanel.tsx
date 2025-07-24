import { MetricCard } from './MetricCard';
import { useTranslation } from "next-i18next";

interface BotActivity {
  user_agent: string;
  request_count: number;
  last_seen: string;
  block_rate: number;
}

interface BotActivityPanelProps {
  botActivities: BotActivity[];
}

export const BotActivityPanel = ({ botActivities }: BotActivityPanelProps) => {
  const { t } = useTranslation("common");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t("detected_agents")} 
          value={botActivities.length} 
          description={t("identified_bot_agents")} 
          color="bg-orange-50"
        />
        
        <MetricCard 
          title={t("total_requests")} 
          value={botActivities.reduce((sum, bot) => sum + bot.request_count, 0)} 
          description={t("from_all_bots")} 
        />
        
        <MetricCard 
          title={t("most_active_bot")} 
          value={botActivities[0]?.user_agent.split('/')[0] || 'N/A'} 
          description={`${botActivities[0]?.request_count || 0} ${t("requests")}`} 
          color="bg-red-50"
        />
        
        <MetricCard 
          title={t("block_rate")} 
          value={`${botActivities.reduce((sum, bot) => sum + bot.block_rate, 0) / botActivities.length || 0}%`} 
          description={t("average_block_rate")} 
          color="bg-yellow-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">{t("bot_activity")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("user_agent")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("requests")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("block_rate")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("last_activity")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {botActivities.map((bot, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{bot.user_agent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bot.request_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-red-600 h-2.5 rounded-full" 
                          style={{ width: `${bot.block_rate}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{bot.block_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bot.last_seen).toLocaleString()}
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