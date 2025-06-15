// hooks/useFetchHistory.ts
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    apiFetch<HistoryEntry[]>("http://localhost:8000/user/access-history")
      .then(setHistory)
      .catch((err) => setError(err.message));
  }, [user]);

  return { history, error };
}