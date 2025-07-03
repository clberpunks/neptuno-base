/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const backendUrl = process.env.BACKEND_URL;

// next.config.js
const nextConfig = {
  //basePath: "/user",
  // imágenes o assets en /public
  assetPrefix: "/user",
};

module.exports = {
  //basePath: "/user",
  reactStrictMode: true,
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "es",
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
  serverOptions: {
    host: "0.0.0.0",
    port: 3000,
  },
  async rewrites() {
    return [
      {
        source: "/rest/:path*",
        destination: `${backendUrl}/:path*`, // proxy a backend
      },
    ];
  },
  //async redirects() {
  //  return [
  //    {
  //      source: "/",
  //      destination: "/user",
  //      permanent: false,
  //    },
  //  ];
  //},
};
