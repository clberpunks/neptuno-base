// components/ProfileSection.tsx
import { useTranslation } from "next-i18next";

import SubscriptionSelector from "./SuscriptionSelector";
import AccessHistory from "./AccessHistory";
import ExpandablePanel from "../shared/ExpandablePanel";
import { UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import UserInfo from "./UserInfo";

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at?: string;
    last_login?: string;
    subscription?: {
      plan: string;
      created_at?: string;
      renews_at?: string;
      traffic_limit: number;
      domain_limit: number;
      user_limit: number;
      price: number;
      traffic_used?: number;
    };
    [key: string]: any;
  };
  accessHistory?: Array<{
    timestamp: string;
    login_method: string;
    ip_address: string;
  }>;
  formatDate: (dateString?: string) => string;
}

export default function ProfileSection({
  user,
  accessHistory,
  formatDate,
}: ProfileSectionProps) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-6">
     {/* <UserInfoCard user={user} formatDate={formatDate} /> */}
     <UserInfo user={user} formatDate={formatDate}  subscription={user.subscription}   />

      {user.subscription && typeof user.subscription === "object" && (
        <>
          {/* <SubscriptionInfo 
            subscription={user.subscription} 
            formatDate={formatDate} 
          /> */}
          <SubscriptionSelector />
        </>
      )}

      <AccessHistory 
        accessHistory={accessHistory} 
        formatDate={formatDate} 
        user={user} 
      />

      <ExpandablePanel
        title={t("profile_info")}
        icon={<UserIcon className="h-6 w-6" />}
        statusLabel={t("view_details")}
        statusColor="bg-gray-100 text-gray-800"
        defaultExpanded={false}
      >
        <div className="overflow-hidden bg-gray-50 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {Object.entries(user).map(([key, value]) => {
                if (typeof value === "object" && value !== null) return null;
                return (
                  <tr key={key}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {String(value) || t("not_available")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExpandablePanel>
    </div>
  );
}