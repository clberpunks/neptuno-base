// components/SummarySection.tsx (refactorizado)
// components/SummarySection.tsx
import { useTranslation } from "next-i18next";
import RiskPanel from "./RiskPanel";
import OnboardingGuide from "./OnboardingGuide";
import NotificationsInbox from "../profile/NotificationsInbox";
import SummaryDashboard from "./SummaryDashboard";
import { useState } from "react";

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
  const [range, setRange] = useState<"24h" | "7d" | "15d" | "1m" | "6m" | "1y">("24h");

  // Puedes agregar un selector de rango aquí si lo deseas, por ahora solo pasa el valor
  return (
    <div className="space-y-8">
      <SummaryDashboard range={range} />
      <NotificationsInbox id="notifications" />
      <RiskPanel id="risk-panel" range={range} />
      <OnboardingGuide id="onboarding" />
    </div>
  );
}