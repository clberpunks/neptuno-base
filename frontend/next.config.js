/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

module.exports = {
  reactStrictMode: false, // true,
  i18n,
  images: {
    domains: [
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'ui-avatars.com',
      'www.gravatar.com'
    ]
  }
};



// configurar Next.js para hacer proxy a backend, para que la cookie se quede en el mismo dominio y puerto
// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:8001/:path*', // proxy a backend
//       },
//     ];
//   },
// };
