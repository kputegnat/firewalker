# ADR-0007: AI pipeline as discrete, stored, replayable stages
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
"What the investigator said" → "what the report says" must be auditable; models improve and mistakes must be inspectable. [PDD §8.5, §7]
## Decision
audio → transcript → extraction → mapped values run as separate SQS-driven jobs; every stage output is persisted; re-runs create new versioned Extractions and never overwrite.
## Consequences
Chain of evidence concrete; old transcripts re-processable on model upgrades; more storage and job plumbing than a single-shot call.
## Compliance check
Locked tests R-032/R-033; pr-review rejects pipeline code that mutates prior stage artifacts.
