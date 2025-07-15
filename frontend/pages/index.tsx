import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextPage } from 'next';

const IndexPage: NextPage = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ locale, resolvedUrl, req }) => {
  // Redirigir si es solo el locale (/es o /en)
  if (resolvedUrl === `/${locale}`) {
    return {
      redirect: {
        destination: `/${locale}/dashboard`,
        permanent: false,
      },
    };
  }

  // Redirigir la raíz (/)
  if (resolvedUrl === '/') {
    return {
      redirect: {
        destination: '/public', // o a tu locale por defecto
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'es', ['common'])),
    },
  };
};

export default IndexPage;