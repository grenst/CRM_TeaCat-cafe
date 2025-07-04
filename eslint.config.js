import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

export default [
  eslint.configs.recommended,
  {
    files: ['*/src/**/*.ts'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './*/tsconfig.json'
      },
      globals: {
        process: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      semi: ['error', 'always']
    }
  }
];