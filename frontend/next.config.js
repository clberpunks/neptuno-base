/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

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
<<<<<<< HEAD
         source: '/_backend/:path*',
=======
         source: '/api/:path*',
>>>>>>> b0f8d237981ee306cfe22d785894aaa0b277b5e3
         destination: 'http://localhost:8001/:path*', // proxy a backend
       },
    ];
   },
};
