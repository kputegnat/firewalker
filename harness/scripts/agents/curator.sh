#!/bin/sh
# Curator call point (briefing production). The engine names the task file in
# the prompt contract; cwd = repo root.
set -eu
exec sh harness/scripts/agents/_invoke.sh curator .claude/permissions/curator.json \
"Produce the briefing requested by the orchestrator (task file named on stdin/context) per your definition: minimal named-file reading list, quoted constraints, touchpoint directives. Write it under kb/briefings/. JSON result shape: {\"briefing\":\"kb/briefings/<task>.md\",\"usage\":{...}}"
