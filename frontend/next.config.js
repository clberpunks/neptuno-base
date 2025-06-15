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
  }
};

