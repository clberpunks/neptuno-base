// frontend/components/profile/UserInfoCard.tsx
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

  // Función para formatear fechas más cortas
  const shortFormatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
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
            className="rounded-full w-10 h-10 flex-shrink-0"
            unoptimized={process.env.NODE_ENV === "development"}
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{user.name}</h1>
            <p className="text-gray-600 text-sm truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {user.role}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            {t("active")}
          </span>
          {user.created_at && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {t("user_since")} {shortFormatDate(user.created_at)}
            </span>
          )}
          {user.last_login && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {t("last_login_short")} {shortFormatDate(user.last_login)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}