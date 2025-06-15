// hooks/useLogin.ts
import { useState, useCallback } from "react";
import { useRouter } from "next/router";

export function useLogin() {
  const router = useRouter();
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
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) throw new Error("Credenciales incorrectas");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [email, password, remember, router]);

  return { email, setEmail, password, setPassword, remember, setRemember, loading, error, handleSubmit };
}