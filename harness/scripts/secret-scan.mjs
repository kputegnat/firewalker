#!/usr/bin/env node
// Gate 4 fixture-stack binding: pattern-based secrets scan over tracked files.
// Production installs bind gitleaks (gates-and-hooks.md); this script is the
// engine's stack-agnostic stand-in with the same fail mode (hard, exit 1).
// usage: secret-scan.mjs [dir=.]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PATTERNS = [
  { name: 'aws-access-key-id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'private-key-block', re: /-----BEGIN (?:RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/ },
  { name: 'anthropic-style-key', re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: 'assigned-secret', re: /(?:api[_-]?key|secret|token|password)['"]?\s*[:=]\s*['"][A-Za-z0-9+/_-]{20,}['"]/i },
];

const root = process.argv[2] ?? '.';
const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter((f) => f !== '' && !f.endsWith('.md') && !f.includes('secret-scan'));

let findings = 0;
for (const file of files) {
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue;
  }
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const { name, re } of PATTERNS) {
      if (re.test(lines[i])) {
        console.error(`SECRET ${file}:${i + 1} [${name}]`);
        findings++;
      }
    }
  }
}
if (findings > 0) {
  console.error(`secret-scan: ${findings} finding(s) — gate 4 FAIL`);
  process.exit(1);
}
console.log(`secret-scan: clean (${files.length} files)`);
