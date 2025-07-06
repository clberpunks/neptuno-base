// components/SummarySection.tsx (refactorizado)
import Image from "next/image";
import { useTranslation } from "next-i18next";
import RiskPanel from "./RiskPanel";
import OnboardingGuide from "./OnboardingGuide";
import NotificationsInbox from "../profile/NotificationsInbox";

interface SummarySectionProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at?: string;
    last_login?: string;
  };
  formatDate: (dateString?: string) => string;
}

export default function SummarySection({ user, formatDate }: SummarySectionProps) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-8">
      <NotificationsInbox />

      <RiskPanel />

      <OnboardingGuide />
      
      

      


    </div>
  );
}