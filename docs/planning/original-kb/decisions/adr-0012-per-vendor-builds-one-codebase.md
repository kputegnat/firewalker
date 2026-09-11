# ADR-0012: Per-vendor branded builds; one codebase; per-customer is config only
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Vendors need their brand and their backend; departments must never require builds. [PDD §8.8]
## Decision
One codebase matrix-builds per-vendor variants (name, bundle ID, icon, tokens, endpoint as build config). Department variation is server-delivered configuration. Vendor-specific code paths are forbidden; differences route through feature flags.
## Consequences
N vendors = N wrappers, one product; OTA channels per vendor; functional forking structurally blocked.
## Compliance check
Build matrix is config-directory-driven (review); lint bans vendor identifiers in /app and /api source outside theme/config dirs (gate 1).
