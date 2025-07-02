/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const backendUrl = process.env.BACKEND_URL;

module.exports = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: [
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'ui-avatars.com',
      'www.gravatar.com'
    ]
  },
  serverOptions: {
    host: '0.0.0.0',
    port: 3000,
  },
  async rewrites() {
     return [
       {
         source: '/rest/:path*',
         destination: `${backendUrl}/:path*`, // proxy a backend
       },
    ];
  },
};
