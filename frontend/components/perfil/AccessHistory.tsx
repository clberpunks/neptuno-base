// components/AccessHistory.tsx
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "next-i18next";
import { useFetchHistory } from "../../hooks/userFetchHistory";

export default function AccessHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { history, error } = useFetchHistory(user);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2" aria-label={t("login_history")}>
        {t("login_history")}
      </h2>
      {error ? (
        <p className="text-red-500" role="alert">{error}</p>
      ) : (
        <ul className="list-disc list-inside">
          {history.map((entry) => (
            <li key={entry.id}>
              {new Date(entry.timestamp).toLocaleString()} — {entry.ip_address} — {entry.login_method}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}