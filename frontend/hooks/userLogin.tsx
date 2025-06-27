// hooks/useLogin.tsx
import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./useAuth";
import { apiFetch } from "../utils/api";

export function useLogin() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Introduce un correo válido");
      return;
    }
    if (!password) {
      setError("Introduce una contraseña");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<{ token: string }>("/_backend/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      await refresh();
      router.push("http://localhost:3000/dashboard");
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [email, password, remember, router, refresh]);

  return { email, setEmail, password, setPassword, remember, setRemember, loading, error, handleSubmit };
}