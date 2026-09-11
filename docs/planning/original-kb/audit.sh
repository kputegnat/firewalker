#!/usr/bin/env bash
# kb/audit.sh — mechanical consistency audit for the /kb front-door artifact set.
# Run from anywhere. Exit 0 = clean; exit 1 = findings (listed on stdout).
# Catches the mechanical drift class: count mismatches, dangling refs, missing ACs,
# invalid seed templates. Semantic coverage (PDD<->PRD) needs an adversarial review
# session, not this script.
set -u
cd "$(dirname "$0")"
F=$(mktemp)
trap 'rm -f "$F" /tmp/kb_prd_ids /tmp/kb_mx_ids' EXIT
note() { echo "FINDING: $*" | tee -a "$F" >/dev/null; }

PRD=product/prd.md
MX=product/traceability.md

# 1. PRD rows vs matrix rows: same ID set
grep -oE '^- R-[0-9]+' "$PRD" | sed 's/^- //' | sort -u > /tmp/kb_prd_ids
grep -oE '^\| R-[0-9]+' "$MX" | grep -oE 'R-[0-9]+' | sort -u > /tmp/kb_mx_ids
diff -q /tmp/kb_prd_ids /tmp/kb_mx_ids >/dev/null || note "PRD/matrix ID sets differ: $(diff /tmp/kb_prd_ids /tmp/kb_mx_ids | grep -E '^[<>]' | tr '\n' ' ')"
N=$(wc -l < /tmp/kb_prd_ids)

# 2. Matrix header count matches actual rows
HDR=$(grep -oE 'done [0-9]+/[0-9]+' "$MX" | head -1 | grep -oE '/[0-9]+' | tr -d '/')
[ "${HDR:-0}" = "$N" ] || note "matrix header total (${HDR:-none}) != requirement count ($N)"

# 3. Epic-one rows each carry an AC line
while read -r r; do note "epic-one row $r has no AC line"; done < <(
  awk -v RS='## E' 'NR==2{print}' "$PRD" | awk '/^- R-/{id=$2; getline; if ($0 !~ /AC:/) print id}')

# 4. ADR references in the PRD resolve to files
while read -r a; do
  ls decisions/ | grep -qi "$(echo "$a" | tr '[:upper:]' '[:lower:]')" || note "PRD cites $a but no such file in decisions/"
done < <(grep -oE 'ADR-[0-9]{4}' "$PRD" | sort -u)

# 5. R-IDs cited in ADRs exist in the PRD (strip ADR-#### tokens first so their tails don't match)
while read -r r; do
  grep -q "^- $r " "$PRD" || note "ADR cites $r which is not a PRD requirement"
done < <(sed 's/ADR-[0-9]\{4\}//g' decisions/adr-*.md | grep -oE 'R-[0-9]+' | sort -u)

# 6. Every ADR has Status, Decision, Compliance check
for f in decisions/adr-*.md; do
  grep -q '^Status:' "$f" || note "$f missing Status line"
  grep -q '^## Decision' "$f" || note "$f missing Decision section"
  grep -q '^## Compliance check' "$f" || note "$f missing Compliance check section"
done

# 7. Seed templates: valid JSON; showIf targets resolve; locked prompts cite requiredBy; unique promptIds
for t in product/templates/*.json; do
  python3 - "$t" 2>>"$F" << 'PY' | tee -a "$F" >/dev/null
import json, sys
t = sys.argv[1]
try: d = json.load(open(t))
except Exception as e: print(f"FINDING: {t} invalid JSON: {e}"); sys.exit(0)
prompts = [p for s in d.get('sections', []) for p in s.get('prompts', [])]
ids = [p['promptId'] for p in prompts]
if len(ids) != len(set(ids)): print(f"FINDING: {t} duplicate promptIds")
idset = set(ids)
for s in d.get('sections', []):
    for node in [s] + s.get('prompts', []):
        si = node.get('showIf')
        if si and si.get('promptId') not in idset: print(f"FINDING: {t} dangling showIf -> {si.get('promptId')}")
for p in prompts:
    if p.get('lockability') == 'locked' and not p.get('requiredBy'): print(f"FINDING: {t} locked prompt {p['promptId']} missing requiredBy")
PY
done

# 8. A readiness record exists
ls product/readiness-record-*.md >/dev/null 2>&1 || note "no readiness record in product/"

if [ -s "$F" ]; then cat "$F"; echo "kb audit: $(wc -l < "$F") finding(s)"; exit 1; fi
echo "kb audit: clean ($N requirements, $(ls decisions/adr-*.md | wc -l) ADRs)"
