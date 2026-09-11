# ADR-0016: Engine box and vendor AWS stay credential-separated
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
The build engine runs in owner AWS; the product may deploy into vendor AWS; autonomous agents must never hold vendor credentials. [PDD §9.2–9.3]
## Decision
The engine box touches only GitHub and owner staging. Vendor-environment deploys run from GitHub Actions via OIDC-assumed scoped roles (or artifact handoff), never from the box.
## Consequences
Vendor due-diligence clean; blast radius contained; adds one indirection to vendor deploys.
## Compliance check
Secret-scan gate + box IAM policy review: no vendor-account principals reachable from box identity.
