# ADR-0011: Multi-tenant data model from the first migration
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Retrofitting tenant boundaries into a live evidence store is misery; hierarchy is platform → vendor → org → user. [PDD §8.8]
## Decision
Every tenant-owned table carries org scoping from migration 0001; all queries are tenant-scoped at the repo layer; vendor isolation lands at deployment boundary.
## Consequences
Pilot runs single-org on multi-tenant rails; no migration cliff later; slight early schema/query overhead.
## Compliance check
Migration review rejects tenant-owned tables lacking org_id; repo-layer scoping covered by tests (E08).
