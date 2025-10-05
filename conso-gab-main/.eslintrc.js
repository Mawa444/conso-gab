// ✅ ESLINT CONFIGURATION MODERNE ET PROGRESSIVE

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js', 'node_modules', 'build'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    '@typescript-eslint',
    'import',
  ],
  rules: {
    // ✅ ERREURS CRITIQUES UNIQUEMENT (Phase 1)
    'no-console': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Désactivé temporairement
    '@typescript-eslint/no-unused-vars': 'off', // Désactivé temporairement

    // ✅ ACCESSIBILITÉ
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',

    // ✅ REACT
    'react/react-in-jsx-scope': 'off', // React 17+
    'react/prop-types': 'off', // TypeScript gère ça
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ✅ IMPORTS
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],

    // ✅ TYPESCRIPT (LÉGER)
    '@typescript-eslint/no-explicit-any': 'warn', // Passe à error Phase 2
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};