// pages/_app.tsx

// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import Layout from '../components/Layout';
import { AuthProvider } from '../hooks/useAuth';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default appWithTranslation(MyApp);