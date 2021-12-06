module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    'no-use-before-define': ['error', { functions: false, classes: true }],
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': ['warn', { singleQuote: true, trailingComma: 'es5' }],
    'import/extensions': ['error', 'always', { ignorePackages: true }],
  },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.mjs'] },
    },
  },
};
