#!/usr/bin/env node
// Gate-3 / matrix.sh test contract (ADR-0001): file-per-test runner honoring
// HARNESS_PENDING_EXCLUDES (comma-separated repo-relative paths — tagged
// redness tolerated, untagged failure blocks). Called two ways:
//   gate 3:      node harness/run-tests.mjs            → run all tests/
//   matrix.sh:   node harness/run-tests.mjs <files...> → run exactly those
// .test.js files run under node; .test.ts files run under vitest (the bound
// runner per ADR-0001) once TS tests exist.
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const excludes = (process.env.HARNESS_PENDING_EXCLUDES || '').split(',').filter(Boolean);
let files = process.argv.slice(2);
if (files.length === 0) {
  files = existsSync('tests')
    ? readdirSync('tests').filter((f) => /\.test\.(js|ts)$/.test(f)).map((f) => `tests/${f}`)
    : [];
}
files = files.map((f) => f.replaceAll('\\', '/')).filter((f) => !excludes.includes(f));

for (const f of files) {
  // vitest invoked via its JS entry — cross-platform, no shell (gate 6: spawn-shell-true)
  const r = f.endsWith('.ts')
    ? spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', f], { encoding: 'utf8' })
    : spawnSync(process.execPath, [f], { encoding: 'utf8' });
  if (r.status !== 0) {
    process.stderr.write(`FAIL ${f}\n${r.stderr || ''}${r.stdout || ''}`);
    process.exit(1);
  }
}
console.log(`suite green (${files.length} file(s) run${excludes.length ? `, ${excludes.length} pending-tagged excluded` : ''})`);
