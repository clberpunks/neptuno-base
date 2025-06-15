// frontend/hooks/useAuth.ts
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: "admin" | "user";
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    setLoading(true);
    fetch("http://localhost:8000/auth/user", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          try {
            // Si el backend devuelve un string JSON, parsea
            const parsed: User = typeof data === "string" ? JSON.parse(data) : data;
            setUser(parsed);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUser();
    // Si quieres refrescar cada X minutos, podrías usar setInterval aquí
    // return () => clearInterval(timerId);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
