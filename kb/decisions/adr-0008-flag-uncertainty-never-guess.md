# ADR-0008: Uncertainty is flagged for human resolution, never silently guessed
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
A confident wrong detail in a legal report is worse than a visible gap. [PDD §4-P3, §5.3]
## Decision
Below-threshold transcription/extraction confidence marks the field as flagged; flagged fields are excluded from bulk approval and presented as questions in review.
## Consequences
Review carries real decisions; extraction prompts must emit calibrated confidence; thresholds are config, tuned during pilot.
## Compliance check
Locked tests R-034/R-042; extraction prompt contract requires confidence per field (structured-output validation).
