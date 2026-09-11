# API Contracts
<!-- Budget: 400 lines. Owner file for external API shapes and the error envelope. -->
<!-- STATUS: PLANNED — greenfield. No routes exist. OpenAPI is generated from /shared zod schemas once /api lands (ADR-0014). -->

## Conventions (binding once routes exist)
- Base path `/v1`; resource naming per kb/conventions/naming.md R4. Canonical planned route (PRD R-020): `POST /v1/sessions/:id/ops` — idempotent batch op ingestion, per-op receipt statuses.
- Domain shapes: zod schemas from /shared are the single source; handlers validate at the boundary; OpenAPI generated, never hand-written.
- Error envelope: see kb/conventions/error-handling.md.
- No op mutation endpoints, ever (ADR-0003 compliance: route review + gate).

## Inventory
(empty — populated by workers with their PRs; kb-same-PR rule enforces)
