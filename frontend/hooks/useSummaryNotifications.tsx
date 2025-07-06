// hooks/useSummaryNotifications.ts
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export function useSummaryNotifications(): number {
  const [count, setCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch<{ unseen: number }>("/rest/user/notifications/unseen-count");
      setCount(res.unseen);
    } catch (e) {
      console.error("Error fetching unseen summary notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 10000); // cada 10s
    return () => clearInterval(id);
  }, []);

  return count;
}
