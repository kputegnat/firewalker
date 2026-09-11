# ADR-0014: Stack — React/TS/Vite + Capacitor; Node/TS Fastify; Postgres; S3; SQS; Terraform; monorepo with /shared zod
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
One language end to end; types as single source of truth; acquirer-legible boring choices. [PDD §8.1, §10]
## Decision
Monorepo /app /api /pipeline /shared /infra /docs; zod schemas in /shared are the only domain type source; routes→services→repos layering; TS strict from day one; Fastify for HTTP.
## Consequences
Client/server cannot drift on domain shapes; OpenAPI generated from zod; NestJS option foreclosed (revisit only by superseding ADR).
## Compliance check
Gate: typecheck strict; lint layering rules (no repo imports in routes); duplicate-type detector across packages.
