#!/bin/sh
# Conflict-resolver call point (worker instance with both briefings; SI §7).
set -eu
exec sh harness/scripts/agents/_invoke.sh worker .claude/permissions/worker.json \
"You are dispatched as CONFLICT-RESOLVER on the rebase conflict the orchestrator has staged in this worktree. Resolve within both tasks' directives; any architecture choice → STOP and report for a QUESTION. JSON result shape: {\"status\":\"resolved|question\",\"detail\":\"...\",\"usage\":{...}}"
