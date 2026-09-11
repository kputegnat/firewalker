#!/usr/bin/env node
// Test-file lock PreToolUse hook (SI §7): DENY Edit/Write to files listed in
// harness/state/locked-tests.json on ALL branches, unless the entry carries a
// criteria-change token AND the env names it (HARNESS_CRITERIA_CHANGE=<token>).
// Hook contract: tool input JSON on stdin; exit 2 = deny (stderr shown), 0 = allow.
import { readFileSync, existsSync } from 'node:fs';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch { process.exit(0); }
let path = '';
try {
  const j = JSON.parse(input);
  path = (j.tool_input?.file_path ?? '').replaceAll('\\', '/');
} catch { process.exit(0); }
if (!path || !existsSync('harness/state/locked-tests.json')) process.exit(0);

let entries = [];
try { entries = JSON.parse(readFileSync('harness/state/locked-tests.json', 'utf8')); } catch { process.exit(0); }
const rel = path.includes('/') ? path.slice(path.indexOf('tests/')) : path;
const hit = (Array.isArray(entries) ? entries : []).find(
  (e) => e && typeof e.path === 'string' && (path.endsWith(e.path) || rel === e.path),
);
if (!hit) process.exit(0);
const token = process.env.HARNESS_CRITERIA_CHANGE ?? '';
if (token !== '' && hit.criteriaChangeToken === token) process.exit(0);
console.error(`LOCKED TEST: ${hit.path} is a locked acceptance test (task ${hit.task}). Edits require a criteria-change token (authorizing ADR/spec-delta id) recorded in the locked-tests manifest. (SI §7 test-file lock)`);
process.exit(2);
