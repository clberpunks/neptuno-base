// components/OnboardingGuide.tsx
import { useState } from 'react';
import Link from "next/link";
import { useTranslation } from "next-i18next";
import ExpandablePanel from "../shared/ExpandablePanel";
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  LightBulbIcon 
} from "@heroicons/react/24/outline";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  color: string;
}

export default function OnboardingGuide({ id }: { id?: string }) {
  const { t } = useTranslation('common');
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "analyze",
      title: t("onboarding_analyze_title"),
      description: t("onboarding_analyze_desc"),
      completed: false,
      link: "/dashboard/#code",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      id: "protect",
      title: t("onboarding_protect_title"),
      description: t("onboarding_protect_desc"),
      completed: false,
      link: "/firewall",
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: "legal",
      title: t("onboarding_legal_title"),
      description: t("onboarding_legal_desc"),
      completed: false,
      link: "/compliance",
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: "reports",
      title: t("onboarding_reports_title"),
      description: t("onboarding_reports_desc"),
      completed: false,
      link: "/reports",
      color: "bg-green-100 text-green-800"
    }
  ]);

  const completeStep = (id: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, completed: true } : step
    ));
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;

  return (
    <ExpandablePanel
      id={id}
      title={t("onboarding_title")}
      description={t("onboarding_subtitle")}
      icon={<LightBulbIcon className="h-6 w-6" />}
      statusLabel={`${completedSteps}/${totalSteps} ${t("completed")}`}
      statusColor="bg-indigo-100 text-indigo-800"
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 transition-opacity duration-300">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`border rounded-lg p-5 transition-all duration-200 ${
              step.completed 
                ? "border-green-300 bg-green-50" 
                : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${step.color} ${
                step.completed ? "!bg-green-100 !text-green-600" : ""
              }`}>
                {step.completed ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <span className="text-lg font-medium">
                    {steps.findIndex(s => s.id === step.id) + 1}
                  </span>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className={`text-lg font-medium ${
                  step.completed ? "text-green-700" : "text-gray-900"
                }`}>
                  {step.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  {step.description}
                </p>
                
                <div className="mt-4">
                  <Link href={step.link}>
                    <button
                      onClick={() => completeStep(step.id)}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        step.completed
                          ? "bg-green-100 text-green-700"
                          : `${step.color.replace("bg-", "bg-").replace("text-", "text-")} hover:opacity-90`
                      }`}
                    >
                      {step.completed ? t("completed") : t("get_started")}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ExpandablePanel>
  );
}