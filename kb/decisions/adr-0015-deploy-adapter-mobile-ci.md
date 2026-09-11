# ADR-0015: Deploy adapter — GitHub Actions builds both apps; engine box never builds or signs
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
The engine box is Linux and must stay single-purpose; iOS requires macOS; signing secrets must not live in agent-operated environments. [PDD §9.3; engine D-7 box]
## Decision
GitHub Actions is the build adapter: macOS runner → TestFlight (staging-equivalent), Linux runner → Play internal track; Capgo for OTA JS updates; signing credentials only in Actions secrets. Backend: staging auto-deploy on merge; production human-gated. Engine box scope ends at merge-to-main.
## Consequences
Bootstrap P6 binds these as the mobile adapter; store-review latency only at production promotion; box compromise cannot leak signing keys.
## Compliance check
Self-attack fixture: signing-secret reference in box-executed scripts fails secret-scan gate; P6 walk-through verifies both tracks.
