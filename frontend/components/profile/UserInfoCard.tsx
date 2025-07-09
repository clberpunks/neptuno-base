// components/UserInfoCard.tsx
import Image from "next/image";
import { useTranslation } from "next-i18next";

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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
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
          className="rounded-full w-10 h-10"
          unoptimized={process.env.NODE_ENV === "development"}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{user.name}</h1>
          <p className="text-gray-600 text-sm truncate">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {user.role}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            {t("active")}
          </span>
          {user.created_at && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {t("created_at")}: {formatDate(user.created_at)}
            </span>
          )}
          {user.last_login && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {t("last_login")}: {formatDate(user.last_login)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}