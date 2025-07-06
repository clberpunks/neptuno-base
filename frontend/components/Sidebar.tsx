// components/Sidebar.tsx
// components/Sidebar.tsx
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useRadarNotifications } from "../hooks/useRadarNotifications";

interface Props {
  onSelect: (
    section:
      | "summary"
      | "profile"
      | "logins"
      | "radar"
      | "firewall"
      | "help"
      | "compliance"
      | "reports"
      | "admin"
  ) => void;
  currentSection: string;
}

export default function Sidebar({ onSelect, currentSection }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const unseen = useRadarNotifications();


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (section: string) =>
    currentSection === section
      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
      : "text-gray-700 hover:bg-gray-100";

  // Icono de engranaje reutilizable
  const GearIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31 2.37 2.37a1.724 1.724 0 002.572-1.065c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  // Menú para mobil

  const mobileBottomMenuItems = [
    {
      section: "summary",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      section: "firewall",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      section: "radar",
      icon: (
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10h6m-6 0a4 4 0 118 0" />
          </svg>
          {unseen > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] leading-tight font-bold rounded-full px-1.5">
              {unseen > 9 ? "9+" : unseen}
            </span>
          )}
        </div>
      ),
    },
    {
      section: "compliance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      section: "reports",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];


  if (isMobile) {
    return (
      <>
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16 flex items-center px-4">
          {/* Profile Button (Left) */}
          <button
            onClick={() => onSelect("profile")}
            className={`flex items-center ${
              currentSection === "profile" ? "text-indigo-600" : "text-gray-600"
            }`}
          >
            <svg
              className="w-6 h-6 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm font-medium">{t("profile")}</span>
          </button>

          {/* App Name (Center) */}
          <div className="flex-grow text-center">
            <span className="text-lg font-semibold text-indigo-600">
              {appName}
            </span>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3">
            {/* Admin Settings Button (only for admin users) */}
            {user?.role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className={`p-1 rounded-full ${
                  currentSection === "admin"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                aria-label="Admin settings"
              >
                <GearIcon className="w-6 h-6" />
              </button>
            )}

            {/* Help Button */}
            <button
              onClick={() => onSelect("help")}
              className={`p-1 rounded-full ${
                currentSection === "help"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Help"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            {mobileBottomMenuItems.map((item) => (
              <button
                key={item.section}
                onClick={() => onSelect(item.section as any)}
                className={`flex flex-col items-center p-2 ${
                  currentSection === item.section
                    ? "text-indigo-600"
                    : "text-gray-600"
                }`}
                aria-current={
                  currentSection === item.section ? "page" : undefined
                }
              >
                {item.icon}
                <span className="text-xs mt-1">{t(item.section)}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href={siteUrl || "/"} legacyBehavior>
          <a className="flex items-center text-lg font-semibold text-indigo-600">
            {appName}
          </a>
        </Link>
      </div>

      <div className="p-6 border-b border-gray-200 flex items-center">
        {user?.picture || user?.email ? (
          <Image
            src={`https://www.gravatar.com/avatar/${
              user?.email
                ? require("crypto")
                    .createHash("md5")
                    .update(user.email.trim().toLowerCase())
                    .digest("hex")
                : ""
            }?d=mp&s=40`}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full w-10 h-10 mr-3"
            unoptimized={process.env.NODE_ENV === "development"}
          />
        ) : (
          <div className="w-10 h-10 mr-3 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="py-4 flex-grow">
        {/* Summary */}
        <button
          onClick={() => onSelect("summary")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "summary"
          )}`}
          aria-current={currentSection === "summary" ? "page" : undefined}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {t("summary")}
        </button>

        {/* Profile */}
        <button
          onClick={() => onSelect("profile")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "profile"
          )}`}
          aria-current={currentSection === "profile" ? "page" : undefined}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {t("profile")}
        </button>

        {/* Radar */}
        <button
          onClick={() => onSelect("radar")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "radar"
          )}`}
          aria-current={currentSection === "radar" ? "page" : undefined}
        >
          <span className="relative">
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10h6m-6 0a4 4 0 118 0" />
            </svg>
            {unseen > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
                {unseen}
              </span>
            )}
          </span>
          {t("radar")}
        </button>

        {/* Firewall */}
        <button
          onClick={() => onSelect("firewall")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "firewall"
          )}`}
          aria-current={currentSection === "firewall" ? "page" : undefined}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {t("firewall")}
        </button>

        {/* Compliance */}
        <button
          onClick={() => onSelect("compliance")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "compliance"
          )}`}
          aria-current={currentSection === "compliance" ? "page" : undefined}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          {t("compliance")}
        </button>

        {/* Reports */}
        <button
          onClick={() => onSelect("reports")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "reports"
          )}`}
          aria-current={currentSection === "reports" ? "page" : undefined}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {t("reports")}
        </button>

        {/* Help */}
        <button
          onClick={() => onSelect("help")}
          className={`w-full text-left px-6 py-3 flex items-center ${isActive(
            "help"
          )}`}
          aria-current={currentSection === "help" ? "page" : undefined}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t("help")}
        </button>

        {/* Admin Settings (only for admin users) */}
        {user?.role === "admin" && (
          <button
            onClick={() => onSelect("admin")}
            className={`w-full text-left px-6 py-3 flex items-center ${isActive(
              "admin"
            )}`}
            aria-current={currentSection === "admin" ? "page" : undefined}
          >
            <GearIcon className="w-5 h-5 mr-3" />
            {t("admin")}
          </button>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <Link href="logout" legacyBehavior>
          <a className="w-full text-left px-6 py-3 flex items-center text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("logout")}
          </a>
        </Link>
      </div>
    </aside>
  );
}
