import { useTranslation } from "next-i18next";
import ExpandablePanel from "../shared/ExpandablePanel";
import { 
  QuestionMarkCircleIcon, 
  ShieldCheckIcon, 
  UserCircleIcon, 
  EnvelopeIcon 
} from "@heroicons/react/24/outline";

export default function HelpSection() {
  const { t } = useTranslation("common");

  const sections = [
    {
      title: t("how_to_use_radar"),
      content: t("radar_help_content"),
      icon: <QuestionMarkCircleIcon className="h-6 w-6" />,
      statusLabel: t("info"),
      statusColor: "bg-blue-100 text-blue-800"
    },
    {
      title: t("firewall_settings"),
      content: t("firewall_help_content"),
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      statusLabel: t("security"),
      statusColor: "bg-green-100 text-green-800"
    },
    {
      title: t("profile_management"),
      content: t("profile_help_content"),
      icon: <UserCircleIcon className="h-6 w-6" />,
      statusLabel: t("user"),
      statusColor: "bg-purple-100 text-purple-800"
    },
    {
      title: t("contact_support"),
      content: t("contact_help_content"),
      icon: <EnvelopeIcon className="h-6 w-6" />,
      statusLabel: t("support"),
      statusColor: "bg-yellow-100 text-yellow-800"
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">{t("help_and_support")}</h2>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <ExpandablePanel
            key={index}
            title={section.title}
            icon={section.icon}
            statusLabel={section.statusLabel}
            statusColor={section.statusColor}
            defaultExpanded={false}
          >
            <p className="text-gray-600">{section.content}</p>
          </ExpandablePanel>
        ))}
      </div>
    </div>
  );
}