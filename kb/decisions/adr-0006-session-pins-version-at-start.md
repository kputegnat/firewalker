# ADR-0006: Session pins template version at capture start
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Mid-capture template swaps corrupt completeness tracking and the evidentiary record. [PDD §6.2]
## Decision
A session begun under version N completes under version N; newer versions apply to subsequent sessions only, with a non-blocking notice.
## Consequences
Deterministic completeness; in-flight work immune to admin changes; template fixes reach the field on the next job, not the current one.
## Compliance check
Locked test: publish v(N+1) mid-session; session continues and submits under vN.
