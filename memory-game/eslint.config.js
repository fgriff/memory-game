import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },
  {
    ignores: ['node_modules', 'dist'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    rules: {
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'error',
    },
  },
  eslintConfigPrettier,
];
