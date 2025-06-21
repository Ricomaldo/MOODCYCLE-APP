// .eslintrc.cjs - version adaptée
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
    es2021: true,
    node: true,
    'react-native/react-native': true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
  },
  globals: {
    __DEV__: 'readonly',
  },
};
