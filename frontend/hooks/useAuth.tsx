// frontend/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../utils/api";

interface SubscriptionData {
  plan: "free" | "pro" | "business" | "enterprise";
  created_at: string;
  renews_at: string;
  traffic_limit: number;
  domain_limit: number;
  user_limit: number;
  price: number; // Nuevo campo
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: "admin" | "user";
  created_at: string;
  last_login: string;
  subscription: SubscriptionData; // 👈 Asegura que esto no sea string suelto
  //subscription: SubscriptionOut
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
      const u = await apiFetch<User>("/rest/auth/user");
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

  const refresh = async () => {
    await loadUser();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('login');
  };

  useEffect(() => {
    loadUser();
    const id = setInterval(loadUser, 5 * 60 * 1000); // opcional: refresco de sesión
    return () => clearInterval(id);
  }, []);

    // Intervalo para refrescar token cada 1 minuto solo si user existe
  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        refresh();
      }, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

   return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}