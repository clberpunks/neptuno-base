// next.config.js
const path = require("path");
const backendUrl = process.env.BACKEND_URL;

module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ["en", "es", "pt"],
    defaultLocale: "es",
    localeDetection: false, // Cambiado a false para evitar el error
  },
  images: {
    unoptimized: true,
    domains: [
      "via.placeholder.com",
      "lh3.googleusercontent.com",
      "ui-avatars.com",
      "www.gravatar.com",
      "gravatar.com",
      "avatars.githubusercontent.com",
      "cdn.discordapp.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  }, 
  async rewrites() {
    if (!backendUrl) {
      throw new Error("BACKEND_URL no está definido en las variables de entorno.");
    }
    return [
      {
        source: '/rest/:path*',
        destination: `${backendUrl}/:path*`, // Validación de backendUrl
      },
      {
        source: "/_next/static/:path*",
        destination: "/_next/static/:path*",
      }
    ];
  },
  
  async redirects() {
    return [
      {
        source: "/:locale", // Captura /es o /en
        destination: "/:locale/dashboard", // Redirige a /es/dashboard o /en/dashboard
        permanent: false,
        locale: false,
      },
      {
        source: "/", // Redirige la raíz
        destination: "/public", // Al dashboard en español por defecto
        permanent: false,
      },
      // Redirige /es/public a /public/es
      {
        source: "/:locale/public", // Captura /es/public, /en/public, etc.
        destination: "/public/:locale", // Redirige a /public/es, /public/en, etc.
        permanent: false,
        locale: false,
      },
      // Opcional: manejar también el caso con barra final
      {
        source: "/:locale/public/", // Captura /es/public/, /en/public/, etc.
        destination: "/public/:locale", // Redirige a /public/es, /public/en, etc.
        permanent: false,
        locale: false,
      }
    ];
  },

  output: "standalone",
  //experimental: {
  //  outputStandalone: true,
  //},
  experimental: {
    // outputStandalone: true,
    // outputFileTracingRoot: path.join(__dirname, "../../"),
    //outputFileTracingIncludes: {
    //  "/*": ["./public/**/*"],
    //},
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "", // "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ciberpunk.es; frame-ancestors 'none';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), camera=(), microphone=()",
          },
        ],
      },
    ];
  },
};
