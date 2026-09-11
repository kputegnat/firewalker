#!/bin/sh
# Shared agent invocation shim (SI §7a cage; orchestrator.md §LLM call points).
# usage: _invoke.sh <agent-name> <permission-settings-file> <prompt>
# Headless Claude Code: agent definition as appended system prompt, per-agent
# permission settings, structured JSON demanded as the FINAL output. Work
# timeouts are enforced by the ENGINE per type (D-4) — never here.
set -eu
AGENT="$1"; SETTINGS="$2"; PROMPT="$3"
DEF=".claude/agents/${AGENT}.md"
exec claude -p \
  --settings "$SETTINGS" \
  --append-system-prompt "$(cat "$DEF")

You are invoked headless by the orchestrator. End your output with a single \`\`\`json fence containing the structured result the call point requires; include a usage object {\"tokensIn\":n,\"tokensOut\":n,\"costUsd\":n} with your best estimate." \
  "$PROMPT"
