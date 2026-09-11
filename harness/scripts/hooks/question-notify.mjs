#!/usr/bin/env node
// Question notification PostToolUse hook (SI §7 + D-5): fires on Write under
// kb/questions/. Channel per ADR-0001: FILE-ONLY for the supervised era — the
// notification is a repo-adjacent log line; the question file itself is the
// durable record (already on disk before this fires, per D-5).
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';

let j;
try { j = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
const path = (j.tool_input?.file_path ?? '').replaceAll('\\', '/');
if (!/(^|\/)kb\/questions\//.test(path)) process.exit(0);
try {
  mkdirSync('harness/state', { recursive: true });
  appendFileSync('harness/state/notifications.log', `${new Date().toISOString()} QUESTION ${path}\n`);
} catch { /* notification loses immediacy, never information (D-5) */ }
process.exit(0);
