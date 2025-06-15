// pages/dashboard.tsx
// pages/dashboard.tsx - DISEÑO MEJORADO
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Sidebar from "../components/Sidebar";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";

interface UserInfo {
  name: string;
  email: string;
  picture: string;
  role: string;
  created_at?: string;
  last_login?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [section, setSection] = useState<"summary" | "profile" | "logins">(
    "summary"
  );
  const router = useRouter();
  const { t } = useTranslation("common");
  const [accessHistory, setAccessHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:8000/auth/user", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return router.replace("/");
        setUser(JSON.parse(data));

        // Obtener historial de accesos
        fetch("http://localhost:8000/user/access-history", {
          credentials: "include",
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((history) => setAccessHistory(history));
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("not_available");
    const date = new Date(dateString);
    return date.toLocaleDateString(router.locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
          <h2 className="text-xl font-semibold mb-4">{t("access_denied")}</h2>
          <p className="mb-6 text-gray-600">{t("please_login")}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {t("login")}
          </button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (section) {
      case "summary":
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center">
                <Image
                  src={user.picture}
                  alt="avatar"
                  width={96}
                  height={96}
                  className="rounded-full w-24 h-24 md:mr-8 mb-6 md:mb-0 border-4 border-indigo-100"
                />
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  <div className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  {t("account_status")}
                </h3>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-700">{t("active")}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  {t("created_at")}
                </h3>
                <p className="text-gray-700">{formatDate(user.created_at)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  {t("last_login")}
                </h3>
                <p className="text-gray-700">{formatDate(user.last_login)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{t("access_history")}</h3>
              {accessHistory.length === 0 ? (
                <p className="text-gray-500">{t("no_access_history")}</p>
              ) : (
                <ul className="space-y-2">
                  {accessHistory.map((entry, index) => (
                    <li key={index} className="flex justify-between">
                      <span className="text-gray-700">
                        {formatDate(entry.timestamp)}
                      </span>
                      <span className="text-gray-500">
                        {entry.login_method} • {entry.ip_address}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        );
      case "profile":
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{t("profile_info")}</h2>
            <div className="overflow-hidden bg-gray-50 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(user).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof value === "string"
                          ? value
                          : JSON.stringify(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button
                onClick={() => router.push("/user/edit-profile")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                {t("edit_profile")}
              </button>  
            </div>
          </div>
        );

      case "logins":
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{t("login_history")}</h2>
            {accessHistory.length === 0 && !user?.created_at ? (
              <p className="text-gray-500">{t("no_login_history")}</p>
            ) : (
              <ul className="space-y-4">
                {accessHistory.map((entry, index) => (
                  <li
                    key={index}
                    className="border-l-4 pl-4 py-2 border-indigo-600"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(entry.timestamp)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.login_method} • {entry.ip_address}
                    </div>
                  </li>
                ))}

                {user?.created_at && (
                  <li className="border-l-4 pl-4 py-2 border-green-600">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(user.created_at)}
                    </div>
                    <div className="text-sm text-gray-500 italic">
                      {t("account_created")}
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        );

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
              {section === "summary"
                ? t("dashboard_welcome")
                : section === "profile"
                ? t("manage_profile")
                : t("view_access_history")}
            </p>
          </div>

          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
