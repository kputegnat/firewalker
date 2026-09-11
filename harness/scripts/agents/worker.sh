#!/bin/sh
# Worker call point: engine appends the task id ($1); cwd = the task worktree.
set -eu
TASK="${1:?task id}"
exec sh harness/scripts/agents/_invoke.sh worker .claude/permissions/worker.json \
"Execute task ${TASK} per your definition. Read kb/briefings/${TASK}.md and ONLY its named files; verify touchpoints first. Implement to the locked tests; flip your @pending-${TASK} tags; carry kb updates in the same commits. JSON result shape: {\"task\":\"${TASK}\",\"status\":\"complete|blocked\",\"deviations\":\"none|<report>\",\"usage\":{...}}"
