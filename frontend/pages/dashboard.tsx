// pages/dashboard.tsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import Sidebar from "../components/Sidebar";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useAuth } from "../hooks/useAuth";
import { withAuth } from "../utils/withAuth";
import { useFetchHistory } from "../hooks/userFetchHistory";
import RiskPanel from "../components/RiskPanel";
import FirewallManager from '../components/FirewallManager';
import Radar from "../components/Radar";
import TrackingCodePanel from "../components/TrackingCode";
import SummarySection from "../components/SummarySection";
import ProfileSection from "../components/ProfileSection";
import HelpSection from "../components/HelpSection";

interface LoginEntry {
  timestamp: string;
  ip_address: string;
  login_method: string;
}

function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const [section, setSection] = useState<"summary" | "profile" | "logins" | "radar" | "firewall" | "help">(
    "summary"
  );
  const { history: accessHistory } = useFetchHistory(user);

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("not_available");
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderSection = () => {
    if (!user) return null;
    
    switch (section) {
      case "summary":
        return <SummarySection user={user} formatDate={formatDate} />;
      
      case "profile":
        return <ProfileSection user={user} accessHistory={accessHistory} formatDate={formatDate} />;
      
      case "radar":
        return <Radar />;
      
      case "firewall":
        return <FirewallManager />;
      
      case "help":
        return <HelpSection />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar onSelect={setSection} currentSection={section} />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {section === "summary" ? t("dashboard") : t(section)}
            </h1>
            <p className="text-gray-600">
              {(() => {
                switch (section) {
                  case "summary": return t("dashboard_welcome");
                  case "profile": return t("manage_profile_and_access");
                  case "radar": return t("monitor_ai_activity");
                  case "firewall": return t("manage_access_rules");
                  case "help": return t("find_answers_and_support");
                  default: return "";
                }
              })()}
            </p>
          </div>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default withAuth(Dashboard, ["admin", "user"]);

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}