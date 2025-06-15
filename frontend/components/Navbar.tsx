
// components/Navbar.tsx
// components/Navbar.tsx - MODERNIZADO
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch('http://localhost:8000/auth/user', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(JSON.parse(data));
        else setUser(null);
      });
  }, []);

  const changeLang = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-10">
          <Link href="/" className="font-bold text-xl text-indigo-600">
            MyApp
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/about" className="text-gray-700 hover:text-indigo-600 transition-colors">
              {t('about')}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors">
              {t('contact')}
            </Link>
            <Link href="/features" className="text-gray-700 hover:text-indigo-600 transition-colors">
              {t('features')}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 border-r border-gray-200 pr-4">
            <button 
              onClick={() => changeLang('en')} 
              className={`text-sm ${router.locale === 'en' ? 'font-medium text-indigo-600' : 'text-gray-500'}`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button 
              onClick={() => changeLang('es')} 
              className={`text-sm ${router.locale === 'es' ? 'font-medium text-indigo-600' : 'text-gray-500'}`}
              aria-label="Cambiar a Español"
            >
              ES
            </button>
          </div>
          
          {user ? (
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              {t('dashboard')}
            </Link>
          ) : (
            <Link href="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

