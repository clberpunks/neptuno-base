// pages/about.tsx
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function About() {
  const { t } = useTranslation('common');
  
  return (
  
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {t('about_title')}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          {t('about_subtitle')}
        </p>
      </div>
      
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {t('about_feature1_title')}
                </h3>
              </div>
            </div>
            <p className="mt-4 text-base text-gray-500">
              {t('about_feature1_description')}
            </p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {t('about_feature2_title')}
                </h3>
              </div>
            </div>
            <p className="mt-4 text-base text-gray-500">
              {t('about_feature2_description')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-indigo-50 rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {t('about_cta_title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('about_cta_description')}
          </p>
          <div className="mt-8">
            <Link href="contact" legacyBehavior>
              <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('contact_us')}
                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
 
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});