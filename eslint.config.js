import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import jestPlugin from 'eslint-plugin-jest';

export default [
  eslint.configs.recommended,
  {
    files: ['*/src/**/*.ts'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
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
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      jest: jestPlugin
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        process: 'readonly',
        console: 'readonly',
      }
    },
    rules: {
      ...jestPlugin.configs.recommended.rules
    }
  }
];
