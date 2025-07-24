import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import Spinner from "../shared/Spinner";
import ExpandablePanel from "../shared/ExpandablePanel";
import { SummaryPanel } from "./panels/SummaryPanel";
import { FirewallPanel } from "./panels/FirewallPanel";
import { UserActivityPanel } from "./panels/UserActivityPanel";
import { BotActivityPanel } from "./panels/BotActivityPanel";
import SubscriptionPlansPanel from "./panels/SuscriptionPanel";
import {
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UsersIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";

interface DashboardData {
  new_users: number;
  active_users: number;
  churned_users: number;
  estimated_revenue: number;
  plan_distribution: {
    free: number;
    pro: number;
    business: number;
    enterprise: number;
  };
}

interface FirewallStats {
  total: number;
  allow: number;
  block: number;
  limit: number;
  ratelimit: number;
  redirect: number;
  flagged: number;
  other: number;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  request_count: number;
  last_activity: string;
  plan: string;
}

interface BotActivity {
  user_agent: string;
  request_count: number;
  last_seen: string;
  block_rate: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation("common");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [firewallStats, setFirewallStats] = useState<FirewallStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [botActivities, setBotActivities] = useState<BotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboard = await apiFetch<DashboardData>("/rest/admin/overview");
        setDashboardData(dashboard);
        const stats = await apiFetch<FirewallStats>("/rest/logs/stats");
        setFirewallStats(stats);
        const users = await apiFetch<TopUser[]>("/rest/admin/top-users");
        setTopUsers(users);
        const bots = await apiFetch<BotActivity[]>("/rest/admin/bot-activities");
        setBotActivities(bots);
      } catch (err) {
        setError(t("error_loading_data"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }
  if (error)
    return (
      <div className="p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );

  if (!dashboardData || !firewallStats) return null;

  const totalUsers = Object.values(dashboardData.plan_distribution).reduce(
    (sum, count) => sum + count,
    0
  );
  const activePlans = Object.keys(dashboardData.plan_distribution).length;
  const activeRules = firewallStats.total;
  const activeUsers = topUsers.length;
  const detectedBots = botActivities.length;

  return (
    <div className="space-y-6">
      <ExpandablePanel
        title={t("general_summary")}
        icon={<ChartBarIcon className="h-6 w-6" />}
        statusLabel={`${totalUsers} ${t("users")}`}
        statusColor="bg-blue-100 text-blue-800"
        defaultExpanded={true}
      >
        <SummaryPanel data={dashboardData} />
      </ExpandablePanel>

      <ExpandablePanel
        title={t("subscription_plans")}
        icon={<CreditCardIcon className="h-6 w-6" />}
        statusLabel={`${activePlans} ${t("active_plans")}`}
        statusColor="bg-green-100 text-green-800"
      >
        <SubscriptionPlansPanel />
      </ExpandablePanel>

      <ExpandablePanel
        title={t("firewall_analysis")}
        icon={<ShieldCheckIcon className="h-6 w-6" />}
        statusLabel={`${activeRules} ${t("rules")}`}
        statusColor="bg-red-100 text-red-800"
      >
        <FirewallPanel stats={firewallStats} />
      </ExpandablePanel>

      <ExpandablePanel
        title={t("user_activity")}
        icon={<UsersIcon className="h-6 w-6" />}
        statusLabel={`${activeUsers} ${t("active_users")}`}
        statusColor="bg-purple-100 text-purple-800"
      >
        <UserActivityPanel topUsers={topUsers} />
      </ExpandablePanel>

      <ExpandablePanel
        title={t("bot_activity")}
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        statusLabel={`${detectedBots} ${t("detected_bots")}`}
        statusColor="bg-yellow-100 text-yellow-800"
      >
        <BotActivityPanel botActivities={botActivities} />
      </ExpandablePanel>
    </div>
  );
}