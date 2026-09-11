# firewalker
<!-- Satisfies: R8 -->
<!-- Budget: 150 lines. This file is a MAP: hard rules + pointers. Content with an owner file lives THERE. -->

## What this is
Field capture platform for fire inspection & investigation: offline-first evidence capture (voice/photo/selection/text) on mobile, op-log sync, AI transcription/extraction with human review, vendor delivery. Greenfield — planned architecture, minimal code so far.
Stack: TS monorepo (/app /api /pipeline /shared /infra /docs) — React/Vite + Capacitor client, Fastify API, SQS pipeline, Postgres + S3 + Terraform (ADR-0014). Harness: engine v0.9.1 (pinned), see kb/runbooks/pipeline.md.

## Hard rules (hooks also enforce most of these)
1. Acceptance-test files are READ-ONLY to implementation work.
2. Code changes carry their /kb updates in the SAME PR (codemap + owned docs + ADRs for new decisions).
3. Plan touchpoint conflicts with reality → STOP AND REPORT. Never improvise architecture resolutions.
4. Data-access verbs: find|create|append only on op-log/evidence surfaces (update/delete banned there per ADR-0003/0017); find|create|update|delete elsewhere. Synonyms are lint failures.
5. Never load /kb/archive by default. Exhaust is not guidance.
6. status.md is orchestrator-owned and overwritten, never appended.
7. Production deploys, IAM/billable infra changes, and major dependency upgrades require human approval. Always.
8. Domain types come from /shared zod schemas only (ADR-0014); vendor schema types import only inside the vendor-mapping module (ADR-0010).

## Before touching X, read Y
| Touching | Read first |
|---|---|
| Any schema/model | /kb/architecture/data-model.md |
| Any route | /kb/codemap/api-routes.md + /kb/conventions/naming.md |
| Any service | /kb/codemap/services.md |
| Any query | /kb/codemap/data-access.md |
| Any architectural choice | /kb/decisions/ (Accepted ADRs for the domain) |
| Deployment/infra | /kb/runbooks/infrastructure.md |
| Anything at all, if unsure where truth lives | /kb/manifest.md |

## Workflow
- Full protocol: engine runbooks (kb-protocol.md, delivery-loop.md) in the pinned engine checkout — pointer: kb/runbooks/pipeline.md.
- Workers: read your briefing; read ONLY its named files; verify touchpoints first.
- Planners: CITES header mandatory; consult codemap + domain ADRs before breaking down work.
- Agents: definitions in .claude/agents/ are binding, including Out-of-scope sections.

## Commands
- Test: node harness/run-tests.mjs
- Lint: sh harness/scripts/gate-1-lint-naming.sh
- Local gate suite: sh harness/scripts/run-gates-local.sh
- Dev server: none yet (greenfield; binds when /app and /api exist)

## Scoped rules
No scoped CLAUDE.md files yet; they appear per package (/app, /api, /pipeline, /shared) as those packages gain code.
