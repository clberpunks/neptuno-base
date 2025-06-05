// next.config.js
const { i18n } = require('./next-i18next.config');

// Ensure localeDetection is set to false as required by Next.js
const updatedI18n = {
  ...i18n,
  localeDetection: false,
};

module.exports = {
  reactStrictMode: true,
  i18n: updatedI18n,
};

