# ADR-0005: Question snapshot embedded in session; version pointer retained
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Reports must prove years later exactly what was asked, independent of the template service, migrations, or versioning discipline failures. [PDD §6.2]
## Decision
At session start the full question text, ordering, and mappings are copied into the session record; the template version ID is stored alongside. Snapshot for evidence, pointer for operations.
## Consequences
Sessions self-contained and subpoena-proof; storage redundancy accepted; defect tracing by version remains possible.
## Compliance check
Locked test R-004: post-start template edits leave the session snapshot byte-identical.
