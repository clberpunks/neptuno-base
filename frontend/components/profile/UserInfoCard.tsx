// components/UserInfoCard.tsx
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useState } from "react";

interface UserInfoCardProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at?: string;
    last_login?: string;
  };
  formatDate: (dateString?: string) => string;
}

export default function UserInfoCard({ user, formatDate }: UserInfoCardProps) {
  const { t } = useTranslation("common");
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="user-details-section"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
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
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                  {user.role}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </button>

      <div
        id="user-details-section"
        className={`px-6 pb-6 transition-all duration-300 ease-in-out ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-gray-50 px-3 py-1 rounded-full text-sm flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            {t("active")}
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-full text-sm">
            {t("created_at")}: {formatDate(user.created_at)}
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-full text-sm">
            {t("last_login")}: {formatDate(user.last_login)}
          </div>
        </div>
      </div>
    </div>
  );
}
