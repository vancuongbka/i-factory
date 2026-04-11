const base = require('./base');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  ...base,
  extends: [
    ...base.extends,
    'next/core-web-vitals',
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  rules: {
    ...base.rules,
    '@next/next/no-html-link-for-pages': 'error',
    'react/display-name': 'off',
  },
};
