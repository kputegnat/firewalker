# Traceability Matrix — Field Capture Platform
<!-- Satisfies: R13 (harness). Orchestrator-owned working state once the loop activates; seeded at front-door P2. -->
<!-- States: unplanned → planned → tests-locked → in-progress → in-review → done | blocked -->

Updated: 2026-09-06 | done 0/54 | blocked 0

| Req | Requirement (one line) | Epic | Story/Task | Acceptance tests | State |
|---|---|---|---|---|---|
| R-001 | WorkflowTemplate zod schema w/ lockability + mappings | E01 | — | — | unplanned |
| R-002 | CaptureOp zod schema w/ checksum + device timestamp | E01 | — | — | unplanned |
| R-003 | Mock mercantile inspection template (seed) | E01 | — | — | unplanned |
| R-004 | Session pins version + embeds question snapshot | E01 | — | — | unplanned |
| R-005 | Prompt-by-prompt renderer, all answer types | E01 | — | — | unplanned |
| R-006 | Prompt-bound voice notes surviving screen lock | E01 | — | — | unplanned |
| R-007 | Photo capture w/ timestamp+GPS+heading bound to prompt | E01 | — | — | unplanned |
| R-008 | Local-first persistence; full airplane-mode session | E01 | — | — | unplanned |
| R-009 | Crash safety: kill/relaunch loses zero ops | E01 | — | — | unplanned |
| R-010 | Live completeness meter | E01 | — | — | unplanned |
| R-011 | Skip-with-reason recorded as op | E01 | — | — | unplanned |
| R-012 | Free-form observations lane | E01 | — | — | unplanned |
| R-013 | Assignment intake + GPS verify w/ mismatch prompt | E01 | — | — | unplanned |
| R-014 | Photo annotation/tags as ops; originals untouched | E01 | — | — | unplanned |
| R-020 | Idempotent batch op ingestion by UUID | E02 | — | — | unplanned |
| R-021 | Receipt-confirmed local state; "all uploaded" UI | E02 | — | — | unplanned |
| R-022 | Background drain | E02 | — | — | unplanned |
| R-023 | Chunked resumable media upload | E02 | — | — | unplanned |
| R-024 | Postgres+S3 persistence; dual timestamps | E02 | — | — | unplanned |
| R-025 | Ingestion checksum verify; metadata preserved | E02 | — | — | unplanned |
| R-026 | Phone/desktop conflict rules enforced | E02 | — | — | unplanned |
| R-027 | Assignment + template pre-load to device | E02 | — | — | unplanned |
| R-030 | Transcription w/ custom vocab + word confidence | E03 | — | — | unplanned |
| R-031 | Bedrock extraction to snapshot mappings | E03 | — | — | unplanned |
| R-032 | Model+prompt version on every AI output | E03 | — | — | unplanned |
| R-033 | Discrete stored replayable stages | E03 | — | — | unplanned |
| R-034 | Uncertainty flagged, never guessed | E03 | — | — | unplanned |
| R-035 | Gap detection pre-review | E03 | — | — | unplanned |
| R-036 | Contradiction detection flags conflicting evidence | E03 | — | — | unplanned |
| R-040 | Review screen; tap field → source audio | E04 | — | — | unplanned |
| R-041 | Conversational edit → diff → approve | E04 | — | — | unplanned |
| R-042 | Per-field + bulk approval; flags excluded | E04 | — | — | unplanned |
| R-043 | Immutable audit trail; originals untouched | E04 | — | — | unplanned |
| R-050 | Anti-corruption mapping layer (mock vendor schema) | E05 | — | — | unplanned |
| R-051 | Submission lifecycle w/ retry + dead-letter + alert | E05 | — | — | unplanned |
| R-052 | Evidence package export w/ metadata + checksums | E05 | — | — | unplanned |
| R-053 | Assignment pull via mapping layer (mock source) | E05 | — | — | unplanned |
| R-060 | Immutable template versioning | E06 | — | — | unplanned |
| R-061 | Org overrides + base propagation w/ conflict surfacing | E06 | — | — | unplanned |
| R-062 | Lockability in domain language | E06 | — | — | unplanned |
| R-063 | Agent-assisted editing: diff/sandbox/approve | E06 | — | — | unplanned |
| R-064 | Sign-off records incl. on-behalf-of | E06 | — | — | unplanned |
| R-070 | Vendor data model bound (GATED: NDA) | E07 | — | — | unplanned |
| R-071 | Occupancy base templates w/ required_by citations (GATED) | E07 | — | — | unplanned |
| R-072 | NFPA 921-aligned investigation template (GATED) | E07 | — | — | unplanned |
| R-080 | Multi-tenant scoping from migration 0001 | E08 | — | — | unplanned |
| R-081 | Entra SSO + email org discovery | E08 | — | — | unplanned |
| R-082 | Offline token expiry never blocks capture | E08 | — | — | unplanned |
| R-083 | Three-tier role model enforced | E08 | — | — | unplanned |
| R-090 | Object Lock evidence + versioned backups | E09 | — | — | unplanned |
| R-091 | Structured logs w/ sync-queue state; remote retrieval | E09 | — | — | unplanned |
| R-092 | Per-org feature flags | E09 | — | — | unplanned |

| R-093 | Org analytics (time, completeness, skips) | E09 | — | — | unplanned |
| R-094 | Retention schedules + legal hold | E09 | — | — | unplanned |

## Epic completion
| Epic | Integrated | Validated (owner) | Sign-off ref |
|---|---|---|---|
| — | — | — | — |

## Rules
1. Every PRD requirement has ≥1 row before any epic starts implementation.
2. Every row names its exercising tests by tests-locked.
3. blocked rows carry a diagnosis link in status.md.
4. Scope changes are matrix-first. E07 rows remain unplanned until the NDA gate clears (noted per row).
5. E07 milestone validation includes vendor/SME review in addition to owner sign-off.
