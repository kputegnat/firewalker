#!/bin/sh
# Secrets pre-commit PreToolUse hook (SI §7): fires on Bash(git commit);
# gitleaks on the staged diff, falling back to the gate-4 scanner. Exit 2 = deny.
set -u
INPUT=$(cat)
case "$INPUT" in
  *'git commit'*) ;;
  *) exit 0 ;;
esac
if command -v gitleaks >/dev/null 2>&1; then
  if ! gitleaks protect --staged --no-banner --redact >/dev/null 2>&1; then
    echo "SECRETS: gitleaks found findings in the staged diff — commit denied (SI §7 secrets pre-commit)." >&2
    exit 2
  fi
else
  if ! node harness/scripts/secret-scan.mjs >/dev/null 2>&1; then
    echo "SECRETS: secret-scan found findings — commit denied (gitleaks unavailable; gate-4 scanner used)." >&2
    exit 2
  fi
fi
exit 0
