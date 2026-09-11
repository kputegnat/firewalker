#!/bin/sh
# Test-writer call point: writes locked acceptance tests on a tests/* branch.
set -eu
exec sh harness/scripts/agents/_invoke.sh test-writer .claude/permissions/test-writer.json \
"Write the locked acceptance tests for the wave the orchestrator is locking (task files under kb/product/plans/). Tests are file-per-test under tests/, runnable by 'node harness/run-tests.mjs', red-by-design carrying @pending-{task-id} tags. JSON result shape: {\"tests\":[\"tests/...\"],\"lockNote\":\"...\",\"usage\":{...}}"
