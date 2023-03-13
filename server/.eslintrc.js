module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  // "parser":'espress',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-eval': 'off',
    'func-names': 'off',
    'import/no-extraneous-dependencies': 'off',
    'default-param-last': 'off',
    'no-unused-vars': ['error', { varsIgnorePattern: '^ignore\\d*|_ignore$|^unknown\\d*', args: 'none' }],
    camelcase: ['error', { allow: ['_ignore$'] }],
    semi: ['error', 'never', { beforeStatementContinuationChars: 'always' }],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 8 }],
    'max-len': 'off',
    'no-param-reassign': 'off',
    'no-mixed-operators': 'off',
    'consistent-return': 'off',
    'import/prefer-default-export': 'off',
    'prefer-destructuring': 'off',
    'linebreak-style': 'off',
    // 'linebreak-style': ['error', 'windows'],
  },
}
