module.exports = {
  extends: [
    'eslint:recommended', // recommended base rules
    'plugin:prettier/recommended', // use prettier for formatting rules
  ],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {},
}
