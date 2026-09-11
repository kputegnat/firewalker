# Code Map — Data Access
<!-- Budget: 400 lines. Query/repository inventory, 1–2 lines each. -->
<!-- P2 scaffold (greenfield): empty by design — populated by workers in the same PR as repository code (kb-same-PR rule). -->

## Repositories (planned — Postgres per ADR-0013/0014)
(none exist)

## Rules already binding on first repository
- Verb vocabulary per kb/conventions/naming.md R3; op-log/evidence surfaces are find|create|append only (ADR-0003/0017).
- Every tenant-owned query org-scoped at the repo layer (ADR-0011).
- Blob access via the evidence module only; no direct S3 calls from services (ADR-0004/0017).
