// pages/auth/logout.tsx
// frontend/pages/auth/logout.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LogoutPage() {
  const r = useRouter();
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => r.push("login"))
      .catch(() => r.push("login"));
  }, [r]);
  return <p>Cerrando sesión…</p>;
}
