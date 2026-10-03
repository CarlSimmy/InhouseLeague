import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      curly: ['error', 'multi-line', 'consistent'],

      'handle-callback-err': 'off',

      'max-nested-callbacks': [
        'error',
        {
          max: 4,
        },
      ],

      'max-statements-per-line': [
        'error',
        {
          max: 2,
        },
      ],

      'no-console': 'off',
      'no-empty-function': 'error',
      'no-floating-decimal': 'error',
      'no-inline-comments': 'error',
      'no-lonely-if': 'error',

      'no-shadow': [
        'error',
        {
          allow: ['err', 'resolve', 'reject'],
        },
      ],

      'no-var': 'error',
      'prefer-const': 'error',
      'spaced-comment': 'error',
      yoda: 'error',
    },
  },

  eslintConfigPrettier,
];
