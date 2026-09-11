#!/bin/sh
# Diagnosis call point: reads harness/state facts only; script writes the output.
set -eu
exec sh harness/scripts/agents/_invoke.sh pr-reviewer .claude/permissions/diagnosis.json \
"You are dispatched as DIAGNOSIS on the blocked task whose facts (gate, attempts, last failure detail) the orchestrator provides. Read harness/state/** read-only; produce a root-cause hypothesis + suspected layer (product|plan|engine). JSON result shape: {\"hypothesis\":\"...\",\"layer\":\"product|plan|engine\",\"usage\":{...}}"
