#!/usr/bin/env node
// Gate 1 naming-grammar leg (file/dir names): kebab-case enforcement for
// source files, per the bound naming grammar. Production installs add
// eslint naming-convention + check-file; this is the ls-lint-style file leg.
// usage: naming-check.mjs [dir=src]
import { execFileSync } from 'node:child_process';

const KEBAB = /^[a-z0-9]+(?:[-.][a-z0-9]+)*\.(?:ts|js|mjs|cjs)$/;

const dir = process.argv[2] ?? 'src';
const files = execFileSync('git', ['ls-files', `${dir}/**`], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f !== '' && /\.(ts|js|mjs|cjs)$/.test(f));

let violations = 0;
for (const file of files) {
  const base = file.split('/').at(-1) ?? file;
  if (!KEBAB.test(base)) {
    console.error(`NAMING ${file}: '${base}' is not kebab-case`);
    violations++;
  }
}
if (violations > 0) {
  console.error(`naming-check: ${violations} violation(s) — gate 1 FAIL`);
  process.exit(1);
}
console.log(`naming-check: clean (${files.length} files)`);
