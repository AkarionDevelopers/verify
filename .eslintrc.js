module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    'eslint-config-airbnb-base',
  ],
  rules: {
    'import/extensions': ['error', 'always'],
  },
};
