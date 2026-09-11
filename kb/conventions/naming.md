# Naming Grammar
<!-- Satisfies: R10 -->
<!-- Budget: 200 lines. Enforced by lint gate 1 (eslint naming-convention + check-file + harness/scripts/naming-check.mjs); semantic truth enforced by pr-reviewer. -->
<!-- STATUS: ACCEPTED (owner sign-off 2026-09-11, Phase B close) — greenfield grammar (chosen, not inferred), derived from planning-doc conventions where stated (ADR-0003/0010/0014/0017, PRD R-002, PRD §Architecture conventions). BINDING. -->

## R1 — Files
Pattern: `{entity}.{layer}.ts` → `capture-session.service.ts`, `capture-session.routes.ts`, `capture-session.repository.ts`
Layers (closed list): `routes | service | repository | schema | mapper | job | plugin | config`
Entities: kebab-case. `schema` files live in /shared only (ADR-0014); `mapper` files live in the vendor-mapping module only (ADR-0010).
Tests: `{name}.test.ts` colocated with the unit under test; cross-package acceptance tests in `/tests` (locked ACs live here).

## R2 — Directories
Monorepo top level fixed by ADR-0014: `/app /api /pipeline /shared /infra /docs`.
Within /api and /pipeline: vertical domain slices — `src/{domain}/` (e.g. `src/sessions/`, `src/templates/`, `src/extraction/`). Within /app: `src/{feature}/` feature slices. /shared: `src/{domain}.schema.ts` flat.

## R3 — Functions by layer (closed verb vocabularies — synonyms are lint failures)
- Data access, op-log & evidence surfaces: `find | create | append` + Entity (+ ByX). `update`/`delete` are BANNED here — ops and evidence are immutable (ADR-0003/0017).
- Data access, other surfaces: `find | create | update | delete` + Entity (+ ByX) — BANNED: get, fetch, load, retrieve, grab, query.
- Services: verb + noun; verbs from `create | find | update | append | ingest | extract | transcribe | map | submit | review | approve | flag | snapshot | pin | publish | verify`. A name implying read must not write (pr-reviewer enforces).
- Handlers/route registrars: `register{Domain}Routes` per Fastify plugin convention.
- Booleans: `is | has | can | should` prefix — BANNED: flag-ish nouns (activeFlag).

## R4 — Routes
`/v1/{plural-resource}[/{id}][/{sub-resource}]`, kebab-case, no verbs in paths — method carries the verb (canonical example from PRD R-020: `POST /v1/sessions/:id/ops`).

## R5 — Exports & symbols
PascalCase: types, zod schemas (`WorkflowTemplate`, `CaptureOpSchema` — the schema const is `{Entity}Schema`), React components. camelCase: functions, variables. SCREAMING_SNAKE: module constants. No default exports outside React route components.

## R6 — Events/ops/queues
Op types (PRD R-002: past-tense, namespaced): `{domain}.{entity}.{past-tense-verb}` → `capture.voice-note.recorded`, `capture.photo.annotated`, `session.prompt.skipped`.
SQS queues/jobs (ADR-0007 stages): `{stage}-{noun}` → `transcribe-audio`, `extract-transcript`.

## Semantic rule (not lintable — pr-reviewer mandate)
A name must truthfully describe the full behavior. Hidden side effects behind read-sounding names are findings even when the pattern is compliant.

## Baseline
Pre-existing violations: /kb/archive/naming-violations-baseline.md — empty (greenfield); it must never silently grow.
