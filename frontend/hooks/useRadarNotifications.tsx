// frontend/hooks/useRadarNotifications.ts
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export function useRadarNotifications() {
  const [unseen, setUnseen] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await apiFetch<{ unseen: number }>("/rest/logs/unseen");
      setUnseen(res.unseen);
    } catch (e) {
      setUnseen(0);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 10000); // cada 10s
    return () => clearInterval(interval);
  }, []);

  return unseen;
}
