# ADR-0010: Anti-corruption layer at the vendor boundary
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Internal model must survive vendor API churn and enable multi-vendor reuse; acquisition leverage depends on it. [PDD §8.7, §11]
## Decision
The internal capture model is canonical; a dedicated mapping module translates to each vendor schema; vendor schemas are configuration, never imported into domain code. Delivered content is marked approved/final.
## Consequences
New vendor = new mapping config; vendor churn contained to one module; one translation hop of overhead.
## Compliance check
Import-boundary lint: vendor schema types importable only inside /api/…/vendor-mapping (gate 1); mapping-layer locked tests (R-050).
