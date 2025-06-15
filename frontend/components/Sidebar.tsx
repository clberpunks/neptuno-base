// components/Sidebar.tsx
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  onSelect: (section: 'summary' | 'profile' | 'logins') => void;
  currentSection: string;
  user?: {
    name: string;
    email: string;
    picture?: string;
  };
}

export default function Sidebar({ onSelect, currentSection, user }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const isActive = (section: string) => 
    currentSection === section ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100';

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" legacyBehavior>
          <a className="flex items-center text-lg font-semibold text-indigo-600">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('app_name')}
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
          />
        ) : (
          <div className="w-10 h-10 mr-3 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 truncate">{user?.name || 'Usuario'}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
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
      </nav>
      
      <div className="p-4 border-t border-gray-200 mt-auto">
        <Link href="/auth/logout" legacyBehavior>
          <a className="w-full text-left px-6 py-3 flex items-center text-red-600 hover:bg-red-50 rounded-md">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('logout')}
          </a>
        </Link>
      </div>
    </aside>
  );
}