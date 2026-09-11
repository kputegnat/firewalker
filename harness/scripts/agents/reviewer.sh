#!/bin/sh
# Reviewer call point: engine appends gate id + subject — "10 <task>" (pr-review),
# "11 <task>" (kb-verify, curator Job 2), or "plan <id>" (re-vet).
set -eu
GATE="${1:?gate id or 'plan'}"; SUBJECT="${2:?task/plan id}"
case "$GATE" in
  10)   exec sh harness/scripts/agents/_invoke.sh pr-reviewer .claude/permissions/reviewer.json \
        "Gate 10 review of task ${SUBJECT}: diff vs main, briefing kb/briefings/${SUBJECT}.md, task plan, codemap, naming grammar. Produce your verdict document per your output format. JSON result shape: {\"verdict\":\"PASS|KICKBACK\",\"notes\":\"<verdict document>\",\"usage\":{...}}" ;;
  11)   exec sh harness/scripts/agents/_invoke.sh curator .claude/permissions/reviewer.json \
        "Gate 11 kb-verification of task ${SUBJECT} (curator Job 2): does the diff carry its required kb updates (codemap rows, owned docs, ADRs for new decisions)? JSON result shape: {\"verdict\":\"KB-VERIFIED|KICKBACK\",\"notes\":\"...\",\"usage\":{...}}" ;;
  plan) exec sh harness/scripts/agents/_invoke.sh plan-reviewer .claude/permissions/reviewer.json \
        "Re-vet plan ${SUBJECT} after directive changes. JSON result shape: {\"verdict\":\"PASS|KICKBACK\",\"notes\":\"...\",\"usage\":{...}}" ;;
  *)    echo "reviewer.sh: unknown gate '$GATE'" >&2; exit 64 ;;
esac
