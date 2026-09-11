// Gate 1 (lint + naming) — eslint leg. Naming grammar: kb/conventions/naming.md
// (PROPOSED; rules here implement R1/R3/R5 mechanically; semantic truth is the
// pr-reviewer's mandate). Verb-vocabulary enforcement deepens as layers appear.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config(
  { ignores: ['node_modules/**', '**/dist/**', 'docs/**', 'kb/**', 'harness/**', '.claude/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { 'check-file': checkFile },
    rules: {
      // R1: kebab-case files with closed layer suffixes handled by naming-check.mjs;
      // eslint enforces the kebab-case base form.
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { 'src/**/': 'KEBAB_CASE' }],
      // R5: PascalCase types/schemas, camelCase functions, SCREAMING_SNAKE consts.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'variable', modifiers: ['const', 'global'], format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'variable', types: ['boolean'], format: ['camelCase', 'UPPER_CASE'], prefix: ['is', 'has', 'can', 'should', 'IS_', 'HAS_', 'CAN_', 'SHOULD_'] },
      ],
      // error-handling.md rule 2: no silent catch.
      'no-empty': ['error', { allowEmptyCatch: false }],
      // ADR-0002/0004: no browser storage in capture paths (repo-wide until /app slices exist).
      'no-restricted-globals': ['error', { name: 'indexedDB', message: 'ADR-0004: evidence never touches browser storage.' }, { name: 'localStorage', message: 'ADR-0004: evidence never touches browser storage.' }],
    },
  },
);
