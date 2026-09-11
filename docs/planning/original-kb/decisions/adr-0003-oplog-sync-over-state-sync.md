# ADR-0003: Append-only op-log sync, not document/state sync
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Offline-first capture with retries risks duplication and ordering bugs; evidence requires an audit trail. [PDD §8.4]
## Decision
All capture is modeled as immutable operations with client UUIDs and device timestamps; server ingestion is idempotent by op UUID; the op log is the audit trail.
## Consequences
Retries safe; multi-device and future multi-user merge tractable; audit and sync are one mechanism; reads require projection from ops or maintained views.
## Compliance check
Locked test: identical batch ingested twice → identical DB state (E02/R-020); schema forbids op mutation endpoints (route review, gate PR).
