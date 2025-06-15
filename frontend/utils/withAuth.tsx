import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export function withAuth<P>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[] = []
) {
  return function AuthComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace("/auth/login");
          return;
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          router.replace("/403");
          return;
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!user) return null;

    return <WrappedComponent {...props} />;
  };
}
