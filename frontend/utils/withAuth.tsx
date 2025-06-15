// frontend/utils/withAuth.tsx
// frontend/utils/withAuth.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export function withAuth<P>(Component: React.ComponentType<P>, roles: string[] = []) {
  return function Protected(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) router.replace('/auth/login');
        else if (roles.length && !roles.includes(user.role)) router.replace('/403');
      }
    }, [user, loading]);

    if (loading || !user) {
      return <div className="spinner">Cargando…</div>;
    }
    return <Component {...props} />;
  };
}
