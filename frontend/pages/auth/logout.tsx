// pages/auth/logout.ts
// Página que ejecuta logout y redirige al home
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        router.push('/');
      });
  }, [router]);

  return <p className="text-center p-4">Cerrando sesión...</p>;
}
