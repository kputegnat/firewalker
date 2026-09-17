# Knowledgebase Manifest
<!-- Satisfies: R8 -->
<!-- Budget: 150 lines. Owner: curator (only agent that edits this file). Regenerated each janitor pass. -->
<!-- Rule: every /kb file has exactly one row; every topic has exactly one owner file. New /kb files without a row are hook-blocked. -->

Last regenerated: 2026-09-17 | Files: 23 | Over-budget: 0 | Stale (>30d): 0

## Durable truth
| Path | Owns (topic) | Budget | Last verified |
|---|---|---|---|
| /kb/architecture/overview.md | System shape, boundaries, key flows | 400 | 2026-09-11 |
| /kb/architecture/data-model.md | Entities, relations, date/ID semantics | 400 | 2026-09-11 |
| /kb/architecture/api-contracts.md | External API shapes, error envelope | 400 | 2026-09-11 |
| /kb/conventions/naming.md | Naming grammar (files, functions, routes) | 200 | 2026-09-11 |
| /kb/conventions/canonical-surfaces.md | Paved-road registry: canonical surfaces, lint denials, exceptions | 300 | 2026-09-15 |
| /kb/conventions/error-handling.md | Error patterns, envelopes, logging | 200 | 2026-09-11 |
| /kb/codemap/api-routes.md | Route inventory | 400 | 2026-09-11 |
| /kb/codemap/services.md | Service/module inventory | 400 | 2026-09-11 |
| /kb/codemap/data-access.md | Query/repository inventory | 400 | 2026-09-11 |
| /kb/product/prd.md | Full-product requirements (CONTEXT; not current scope) | 500 | 2026-09-17 |
| /kb/product/prototype-prd.md | THE CURRENT BUILD: prototype requirements R-100..R-123 | 300 | 2026-09-17 |
| /kb/product/traceability.md | Requirement→story→test ledger | — (working) | — |
| /kb/runbooks/pipeline.md | How work flows (pointer to engine runbooks) | 100 | 2026-09-11 |
| /kb/runbooks/infrastructure.md | Deploy targets, caps, rollback | 200 | 2026-09-11 |
| /kb/product/readiness-record-E01.md | E01 readiness punch list (front-door P4 draft) | 100 | 2026-09-11 |
| /kb/architecture/design-contract-e01.md | E01 UI contract: tokens, components, interaction rules | 200 | 2026-09-11 |

## Decisions (ADRs)
| ID | Title | Status |
|---|---|---|
| ADR-0001 | Harness foundations — P0 interview record | Accepted |
| ADR-0002 | Capacitor-wrapped web app, not pure PWA | Accepted |
| ADR-0003 | Append-only op-log sync, not document/state sync | Accepted |
| ADR-0004 | Evidence blobs on native filesystem, never browser storage | Accepted |
| ADR-0005 | Question snapshot embedded in session; version pointer retained | Accepted |
| ADR-0006 | Session pins template version at capture start | Accepted |
| ADR-0007 | AI pipeline as discrete, stored, replayable stages | Accepted |
| ADR-0008 | Uncertainty is flagged, never silently guessed | Accepted |
| ADR-0009 | Bedrock (Claude) extraction; Transcribe first, bake-off pending | Accepted |
| ADR-0010 | Anti-corruption layer at the vendor boundary | Accepted |
| ADR-0011 | Multi-tenant data model from the first migration | Accepted |
| ADR-0012 | Per-vendor branded builds; one codebase; config-only per customer | Accepted |
| ADR-0013 | Boring, gov-cloud-portable dependencies only | Accepted |
| ADR-0014 | Stack — React/TS/Vite + Capacitor; Fastify; Postgres; monorepo | Accepted |
| ADR-0015 | Deploy adapter — GH Actions builds; box never builds or signs | Accepted |
| ADR-0016 | Engine box and vendor AWS stay credential-separated | Accepted |
| ADR-0017 | Evidence integrity — checksums, immutable originals, Object Lock | Accepted |
| ADR-0018 | Field-conditions design contract — tokens + field-kit over UI kit | Accepted |
| ADR-0019 | Canonical surfaces and the paved-road mandate | Accepted |
| ADR-0020 | Browser-first prototype; native shell binds at pilot | PROPOSED |

## Working state
/kb/status.md (orchestrator-owned) · /kb/product/traceability.md (orchestrator-owned) · /kb/questions/ (queue) · /kb/briefings/ (live; archived after consumption) · /kb/triage-queue.md (resolved entries archived) · /kb/product/plans/ (active = any matrix row of its epic not yet done) · /kb/product/plans/bugs/ (triage intake) · /kb/product/validation-records/ (owner sign-offs)

## Archive policy
/kb/archive/** is exhaust: consumed briefings, janitor reports, resolved triage entries, baselines, intervention-log.md. Never loaded by default. Current contents: naming-violations-baseline.md, duplication-baseline.md, security-baseline.md (all empty — greenfield).
