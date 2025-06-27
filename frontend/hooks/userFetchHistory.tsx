
// hooks/useFetchHistory.tsx

import { useState, useEffect } from "react";
import { apiFetch } from '../utils/api';

interface HistoryEntry {
  id: string;
  timestamp: string;
  ip_address: string;
  login_method: string;
}

export function useFetchHistory(user: any) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch<HistoryEntry[]>("/_backend/user/access-history")
      .then((data) => {
        setHistory(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching access history:", err);
        setError(err.message || "Error fetching history");
      })
      .finally(() => setLoading(false));
  }, [user]);

  return { history, loading, error };
}
