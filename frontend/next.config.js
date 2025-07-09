// next.config.js
const backendUrl = process.env.BACKEND_URL;

module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
    localeDetection: true,
  },
  images: {
    domains: [
      "via.placeholder.com",
      "lh3.googleusercontent.com",
      "ui-avatars.com",
      "www.gravatar.com",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/rest/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale', // Captura /es o /en
        destination: '/:locale/dashboard', // Redirige a /es/dashboard o /en/dashboard
        permanent: false,
        locale: false, // Importante: desactiva el manejo de locale para esta redirección
      },
      {
        source: '/', // Redirige la raíz
        destination: '/public', // Al dashboard en español por defecto
        permanent: false,
      }
    ];
  }
};