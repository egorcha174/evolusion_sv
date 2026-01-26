
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelteParser from 'svelte-eslint-parser';
import sveltePlugin from 'eslint-plugin-svelte';

export default [
  // Global ignores
  {
    ignores: ['.svelte-kit/**', '*.cjs', 'vite.config.ts.timestamp*'],
  },
  
  // Base configuration for all files
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Configuration for Svelte files
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: {
        ...globals.browser,
      }
    },
    plugins: {
      svelte: sveltePlugin
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
       '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ]
    }
  },

  // Configuration for TS/JS files
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ]
    }
  }
];
