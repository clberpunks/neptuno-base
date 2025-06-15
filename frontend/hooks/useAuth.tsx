// frontend/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../utils/api";

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
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    setLoading(true);
    try {
      const u = await apiFetch<User>("http://localhost:8000/auth/user");
      setUser(u);
    } catch (err: any) {
      if (err.status === 401) {
        setUser(null);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/auth/login');
  };

  useEffect(() => {
    loadUser();
    const id = setInterval(loadUser, 5 * 60 * 1000); // opcional: refresco de sesión
    return () => clearInterval(id);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: loadUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
