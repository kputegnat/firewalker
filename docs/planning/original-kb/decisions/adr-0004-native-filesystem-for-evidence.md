# ADR-0004: Evidence blobs on native filesystem, never browser storage
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Browser storage is evictable on iOS; evidence loss before sync is a liability, not a bug. [PDD §7, §8.2]
## Decision
All capture blobs and the local op log write to the native filesystem via the Capacitor filesystem plugin; SHA-256 computed at capture time.
## Consequences
Survives storage pressure and app kill; enables checksum-verified chain of custody; requires explicit local storage-full handling (R-009 family).
## Compliance check
Lint ban on IndexedDB/localStorage in capture/storage modules (gate 1); crash-safety locked tests (R-009).
