// next.config.js
const path = require("path");
const backendUrl = process.env.BACKEND_URL;

module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ["en", "es", "pt"],
    defaultLocale: "es",
    localeDetection: true,
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
    return [
{
        source: '/rest/:path*',
        destination: `${backendUrl}/rest/:path*`, 
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
        locale: false, // Importante: desactiva el manejo de locale para esta redirección
      },
      {
        source: "/", // Redirige la raíz
        destination: "/public", // Al dashboard en español por defecto
        permanent: false,
      },
      {
        source: "/:locale/public/",
        destination: "/public/:locale",
        permanent: false,
      },
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
