// frontend/components/ErrorBoundary.tsx
import { useEffect } from "react";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../hooks/useAuth";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const { error, setError } = useError();
  const { logout } = useAuth();

  useEffect(() => {
    if (error?.message === "Unauthorized") {
      logout();
      setError(null);
    }
  }, [error, logout, setError]);

  return <>{children}</>;
}
