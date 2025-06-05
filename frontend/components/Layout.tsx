
// components/Layout.tsx
// components/Layout.tsx - ACTUALIZADO
import Navbar from './Navbar';
import Footer from './Footer';
import { useRouter } from 'next/router';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  
  // Excluir layout para rutas específicas
  const noLayoutRoutes = ['/auth/login', '/dashboard', '/dashboard/profile', '/dashboard/logins', '/dashboard/summary', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  const shouldUseLayout = !noLayoutRoutes.includes(router.pathname);

  return shouldUseLayout ? (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-16 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  ) : (
    <>{children}</>
  );
};

export default Layout;