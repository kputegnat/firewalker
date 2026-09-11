#!/usr/bin/env node
// KB budget PreToolUse hook (SI §7): on Edit/Write under kb/, compute the
// prospective line count from the tool input; DENY at >=120% of the file's
// declared budget (exit 2), warn at >=100% (stderr, exit 0). Files without a
// "Budget: N lines" header are exempt (working state).
import { readFileSync } from 'node:fs';

let j;
try { j = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
const path = (j.tool_input?.file_path ?? '').replaceAll('\\', '/');
if (!/(^|\/)kb\//.test(path)) process.exit(0);

let current = '';
try { current = readFileSync(path, 'utf8'); } catch { /* new file */ }
const budgetMatch = (current || j.tool_input?.content || '').match(/Budget:\s*(\d+)\s*lines/i);
if (!budgetMatch) process.exit(0);
const budget = Number(budgetMatch[1]);

let prospective;
if (typeof j.tool_input?.content === 'string') {
  prospective = j.tool_input.content.split('\n').length;
} else if (typeof j.tool_input?.old_string === 'string' && typeof j.tool_input?.new_string === 'string') {
  const delta = j.tool_input.new_string.split('\n').length - j.tool_input.old_string.split('\n').length;
  prospective = current.split('\n').length + delta;
} else {
  process.exit(0);
}
if (prospective >= budget * 1.2) {
  console.error(`KB BUDGET: ${path} would be ${prospective} lines, >=120% of its ${budget}-line budget. Move content (detail → skill/archive; history → git) or raise the budget by ADR. (kb-protocol.md)`);
  process.exit(2);
}
if (prospective >= budget) {
  console.error(`kb-budget warning: ${path} at ${prospective}/${budget} lines (>=100%).`);
}
process.exit(0);
