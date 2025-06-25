// components/Sidebar.tsx
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onSelect: (section: 'summary' | 'profile' | 'logins' | 'radar' | 'firewall') => void;
  currentSection: string;
}

export default function Sidebar({ onSelect, currentSection }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const isActive = (section: string) => 
    currentSection === section ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100';

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" legacyBehavior>
          <a className="flex items-center text-lg font-semibold text-indigo-600">
            MyApp
          </a>
        </Link>
      </div>
      
      <div className="p-6 border-b border-gray-200 flex items-center">
        {user?.picture || user?.email ? (
          <Image 
            src={user?.picture || `https://www.gravatar.com/avatar/${Buffer.from(user?.email || '').toString('base64')}?d=mp&s=40`}
            alt="User Avatar" 
            width={40}
            height={40}
            className="rounded-full w-10 h-10 mr-3"
            unoptimized={process.env.NODE_ENV === "development"}
          />
        ) : (
          <div className="w-10 h-10 mr-3 rounded-full bg-gray-200 flex items-center justify-center"></div>
        )}
        <div>
          <p className="font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      
      <nav className="py-4 flex-grow">
        <button 
          onClick={() => onSelect('summary')} 
          className={`w-full text-left px-6 py-3 flex items-center ${isActive('summary')}`}
          aria-current={currentSection === 'summary' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t('summary')}
        </button>
        <button 
          onClick={() => onSelect('profile')} 
          className={`w-full text-left px-6 py-3 flex items-center ${isActive('profile')}`}
          aria-current={currentSection === 'profile' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {t('profile')}
        </button>
        <button 
          onClick={() => onSelect('logins')} 
          className={`w-full text-left px-6 py-3 flex items-center ${isActive('logins')}`}
          aria-current={currentSection === 'logins' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {t('access')}
        </button>

         <button 
          onClick={() => onSelect('radar')} 
          className={`w-full text-left px-6 py-3 flex items-center ${isActive('radar')}`}
          aria-current={currentSection === 'radar' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" /* ícono de radar */ fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10h6m-6 0a4 4 0 118 0"/>
          </svg>
          {t('radar')}
        </button>

        <button 
          onClick={() => onSelect('firewall')} 
          className={`w-full text-left px-6 py-3 flex items-center ${isActive('firewall')}`}
          aria-current={currentSection === 'firewall' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          {t('firewall')}
        </button>


      </nav>
      <div className="p-4 border-t border-gray-200 mt-auto">
        <Link href="/auth/logout" legacyBehavior>
          <a className="w-full text-left px-6 py-3 flex items-center text-red-600 hover:bg-red-50 rounded-md">
            Logout
          </a>
        </Link>
      </div>
    </aside>
  );
}