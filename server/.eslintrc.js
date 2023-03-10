module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  // "parser":'espress',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
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
    'import/extensions': 'off',
    'linebreak-style': 'off',
    // 'linebreak-style': ['error', 'windows'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // The core 'no-unused-vars' rules (in the eslint:recommended ruleset)
        // does not work with type definitions.
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
}
