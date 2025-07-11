// pages/dashboard.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Sidebar from "../components/Sidebar";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useAuth } from "../hooks/useAuth";
import { withAuth } from "../utils/withAuth";
import { useFetchHistory } from "../hooks/userFetchHistory";
import RiskPanel from "../components/summary/RiskPanel";
import FirewallManager from "../components/firewall/FirewallManager";
import Radar from "../components/radar/Radar";
import TrackingCodePanel from "../components/radar/TrackingCode";
import SummarySection from "../components/summary/SummarySection";
import ProfileSection from "../components/profile/ProfileSection";
import HelpSection from "../components/help/HelpSection";
import CompliancePanel from "../components/compliance/CompliancePanel";
import TermsPanel from "../components/compliance/TermsPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import AdminDashboard from "../components/admin/AdminDashboard";
import Spinner from "../components/shared/Spinner";
import MonetizePanel from "../components/monetize/MonetizePanel";
import BetaBanner from "../components/BetaBanner";

interface LoginEntry {
  timestamp: string;
  ip_address: string;
  login_method: string;
}

function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const [section, setSection] = useState<
    | "summary"
    | "profile"
    | "logins"
    | "radar"
    | "firewall"
    | "help"
    | "compliance"
    | "reports"
    | "admin"
  >("summary");
  const { history: accessHistory } = useFetchHistory(user);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (!user) return <Spinner />;

    switch (section) {
      case "summary":
        return <SummarySection user={user} formatDate={formatDate} />;
      case "profile":
        return (
          <ProfileSection
            user={user}
            accessHistory={accessHistory}
            formatDate={formatDate}
          />
        );
      case "radar":
        return <Radar />;
      case "firewall":
        return <FirewallManager />;
      case "help":
        return <HelpSection />;
      case "compliance":
        return (
          <div className="space-y-6">
            <MonetizePanel />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <ReportsPanel />
          </div>
        );
      case "admin":
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <>
    {!isMobile && <BetaBanner />}
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar onSelect={setSection} currentSection={section} />
      <main className={`flex-1 ${isMobile ? "pt-20 pb-0" : "p-2 md:p-6"}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`${isMobile ? "pt-4 px-4" : "mb-6"}`}>

            {/* <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {section === "summary" 
                ? t("dashboard") 
                : section === "admin"
                ? "Administración"
                : t(section)}
            </h1> */}
            <h2 className="font-bold text-gray-900">
              {(() => {
                switch (section) {
                  case "summary":
                    return t("dashboard_welcome");
                  // case "profile":
                  //   return t("manage_profile_and_access");
                  case "radar":
                    return t("monitor_ai_activity");
                  case "firewall":
                    return t("manage_access_rules");
                  case "help":
                    return t("find_answers_and_support");
                  case "compliance":
                    return t("monetize");
                  case "reports":
                    return "View detailed reports";
                  case "admin":
                    return "Panel de administración del sistema";
                  default:
                    return "";
                }
              })()}
            </h2>
          </div>
          <div className={isMobile ? "px-4" : ""}>{renderSection()}</div>
        </div>
      </main>
    </div>
    </>
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