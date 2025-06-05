// frontend/components/AccessHistory.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "next-i18next";

export default function AccessHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState<
    {
      id: string;
      timestamp: string;
      ip_address: string;
      login_method: string;
    }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    fetch("http://localhost:8000/user/access-history", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setHistory(data));
  }, [user]);

  if (!user) return null;
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t("login_history")}</h2>
      <ul className="list-disc list-inside">
        {history.map((entry) => (
          <li key={entry.id}>
            {new Date(entry.timestamp).toLocaleString()} — {entry.ip_address} —{" "}
            {entry.login_method}
          </li>
        ))}
      </ul>
    </div>
  );
}
