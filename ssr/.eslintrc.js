module.exports = {
  env: {
    es2020: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',

    // #region 不同的eslint配置，针对在nuxt中使用ts

    // v3
    // https://github.com/nuxt/eslint-config#nuxteslint-config
    '@nuxt/eslint-config',

    // v2、3
    // https://github.com/nuxt/eslint-config#nuxtjseslint-config-and-nuxtjseslint-config-typescript
    // '@nuxtjs/eslint-config-typescript',

    // #endregion

    // https://github.com/nuxt/eslint-plugin-nuxt/blob/master/lib/configs/base.js
    // https://github.com/nuxt/eslint-plugin-nuxt/blob/master/lib/configs/recommended.js
    'plugin:nuxt/recommended',
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
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': 'off',
    // 'linebreak-style': ['error', 'windows'],
  },
}
