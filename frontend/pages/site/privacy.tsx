// frontend/pages/privacy.tsx
// pages/privacy.tsx
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

export default function PrivacyPage() {
  const { t } = useTranslation('common');
  
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {t('privacy_title')}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          {t('privacy_subtitle')}
        </p>
      </div>
      
      <div className="mt-12 prose prose-indigo prose-lg text-gray-500 mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">{t('privacy_section1_title')}</h2>
        <p>
          {t('privacy_section1_content')}
        </p>
        
        <h2 className="mt-8 text-2xl font-bold text-gray-900">{t('privacy_section2_title')}</h2>
        <p>
          {t('privacy_section2_content')}
        </p>
        
        <h2 className="mt-8 text-2xl font-bold text-gray-900">{t('privacy_section3_title')}</h2>
        <p>
          {t('privacy_section3_content')}
        </p>
        
        <h2 className="mt-8 text-2xl font-bold text-gray-900">{t('privacy_section4_title')}</h2>
        <p>
          {t('privacy_section4_content')}
        </p>
      </div>
      
      <div className="mt-12 text-center">
        <Link legacyBehavior href="/">
          <a className="inline-flex items-center text-indigo-600 hover:text-indigo-500">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_home')}
          </a>
        </Link>
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});