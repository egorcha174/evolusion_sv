// @ts-check

import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  // 1. Ignore files and directories
  {
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      'node_modules/',
      '.migration/',
      '*.d.ts',
      '*.cjs',
      'tailwind.config.js',
    ],
  },

  // 2. Base configuration (eslint.configs.recommended)
  eslint.configs.recommended,

  // 3. TypeScript-specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './.svelte-kit/tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Some upstream Fusion types may contain duplicate numeric enum values.
      // We keep them intact to avoid behavior drift.
      '@typescript-eslint/no-duplicate-enum-values': 'off',
    },
  },

  // 4. Svelte-specific configuration
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser, // TypeScript parser for <script> blocks
        project: ['./tsconfig.json', './.svelte-kit/tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.svelte'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      svelte,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...svelte.configs.recommended.rules, // Use the recommended rules from the 'svelte' import
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'svelte/no-at-html-tags': 'warn',
    },
  },

  // 5. Prettier integration
  prettierConfig, // Turns off conflicting ESLint rules
  {
    files: ['**/*.{js,ts,svelte}'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
