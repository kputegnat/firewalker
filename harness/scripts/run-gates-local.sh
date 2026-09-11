#!/bin/sh
# Local gate suite (mechanical gates 1,2,4,5,7 + tests) — the developer/worker
# pre-flight. Mirrors harness/config.json order; reviewer gates (10/11) and
# unbound gates (6 pending semgrep, 8/9 deferred) run via the engine/CI.
set -eu
sh harness/scripts/gate-1-lint-naming.sh
npx tsc --noEmit -p tsconfig.json
node harness/run-tests.mjs
node harness/scripts/secret-scan.mjs
npm audit --audit-level=high
npx jscpd --config .jscpd.json
echo "local gates green"
