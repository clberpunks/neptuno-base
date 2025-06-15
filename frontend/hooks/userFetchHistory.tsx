// hooks/useFetchHistory.ts
// hooks/useFetchHistory.ts
import { useState, useEffect } from "react";

interface HistoryEntry {
  id: string;
  timestamp: string;
  ip_address: string;
  login_method: string;
}

export function useFetchHistory(user: any) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("http://localhost:8000/user/access-history", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener el historial");
        return res.json();
      })
      .then(setHistory)
      .catch((err) => setError(err.message));
  }, [user]);

  return { history, error };
}