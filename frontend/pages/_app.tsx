// pages/_app.tsx

// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import Layout from "../components/Layout";
import { AuthProvider } from "../hooks/useAuth";
import { ErrorBoundary } from "../components/ErrorBoundary";
import PixelTracking from "../components/PixelTracking";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Layout>
          <Component {...pageProps} />
          <PixelTracking />
        </Layout>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default appWithTranslation(MyApp);
