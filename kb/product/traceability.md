# Traceability Matrix — firewalker
<!-- Satisfies: R13 -->
<!-- Orchestrator-owned working state. THE definition of done: the product is complete when every row is `done`. -->
<!-- States: unplanned → planned → tests-locked → in-progress → in-review → done | blocked -->
<!-- Hook-enforced: → tests-locked requires committed, locked tests; → done requires green ACs + PASS verdicts + KB-VERIFIED. -->

Updated: 2026-09-11T18:44:21.302Z | done 0/0 | blocked 0

| Req | Requirement (one line) | Epic | Story/Task | Acceptance tests | State |
|---|---|---|---|---|---|

## Epic completion (written by matrix.sh from the integration record + validation record)
| Epic | Integrated (wave/epic checks green) | Validated (owner) | Sign-off ref |
|---|---|---|---|

## Rules
1. Every PRD requirement has ≥1 row before any epic starts implementation (no orphan requirements).
2. A story may serve multiple rows; every row names its exercising tests by the time it is tests-locked.
3. `blocked` rows carry a diagnosis link in status.md; they never sit silent.
4. Milestone feedback creates/updates rows BEFORE work routes to planning (scope changes are matrix-first).

<!-- matrix-checksum: sha256:e3fb7b0bcdec433013647f4be497075a7d38db09ad43c1619e60e522bc8828a3 -->
