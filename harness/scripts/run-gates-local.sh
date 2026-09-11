#!/bin/sh
# Local gate suite (mechanical gates 1,2,4,5,7 + tests) — the developer/worker
# pre-flight. Mirrors harness/config.json order; reviewer gates (10/11) and
# deferred gates (8/9) run via the engine/CI. Gate 6 runs when semgrep is on PATH.
set -eu
sh harness/scripts/gate-1-lint-naming.sh
npx tsc --noEmit -p tsconfig.json
node harness/run-tests.mjs
node harness/scripts/secret-scan.mjs
npm audit --audit-level=high
npx jscpd --config .jscpd.json
if command -v semgrep >/dev/null 2>&1; then semgrep scan --config p/default --config p/typescript --error --quiet; fi
echo "local gates green"
