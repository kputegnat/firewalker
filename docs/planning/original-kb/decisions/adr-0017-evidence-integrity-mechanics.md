# ADR-0017: Evidence integrity mechanics — checksums at capture, immutable originals, Object Lock
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Reports enter litigation; alteration must be disprovable and originals must outlive every derived artifact. [PDD §7]
## Decision
SHA-256 at capture time on every blob; originals never mutated or deleted by application code; server evidence buckets use S3 Object Lock; device and server timestamps both recorded; compression provably preserves EXIF/metadata.
## Consequences
Chain of custody demonstrable; storage cost of originals accepted; deletion/retention becomes an explicit records-law feature, not a CRUD default.
## Compliance check
Locked tests R-002/R-025; lint bans delete/update on evidence repositories (gate 1); Terraform review verifies Object Lock on evidence buckets.
