# PRD — Field Capture Platform (Fire Inspection & Investigation)
<!-- Front-door P2 artifact. Source of intent: /docs/product-design.md (PDD) — rationale lives there; each requirement cites its section. Budget: 500 lines. -->
<!-- Matrix seeded from these rows (all `unplanned`). Task refs assigned by the planner at dissection. -->

## E01 — Offline capture spine (epic one; demo slice core)
<!-- AC channels (Phase C front door, owner-accepted 2026-09-11): [CI] = locked test at mocked-plugin logic level on Linux runners; [device] = named DV-entry in kb/product/validation-records/e01-device-checklist.md, checked at milestone validation. Emulator smoke runs once per epic pre-milestone, non-blocking. -->
- R-001 WorkflowTemplate schema (zod, /shared): sections → prompts → answer types (voice|photo|selection|text; `video` reserved, capture deferred) → required flags → conditional show-if → data-model mappings → lockability metadata (org-may-disable | org-may-reword | locked, required_by) [PDD §6.1, §8.3]
  - AC [CI]: schema compiles strict; R-003 template validates; three invalid fixtures (missing required flag, dangling mapping ref, unknown answer type) each rejected with an error naming the offending path.
- R-002 CaptureOp schema (zod, /shared): op UUID, session ref, prompt ref, op type (past-tense namespaced), device timestamp, payload ref + SHA-256 [PDD §8.3, §7]
  - AC [CI]: schema compiles; ops round-trip JSONL serialize→parse deep-equal; rejects missing checksum on media ops.
- R-003 Mock mercantile inspection template as seed data: ≥25 prompts, ≥1 conditional branch, ≥1 locked question carrying required_by [PDD §6.1; stand-in until E07]
  - AC [CI]: validates against R-001; R-005's CI walk consumes it solely as loader input — no template-specific code paths (pr-review enforced).
- R-004 Session start pins template version and embeds full question snapshot into the session record [PDD §6.2]
  - AC [CI]: session record contains verbatim prompt text/order/mappings; later template edits leave existing session snapshot byte-identical.
- R-005 Prompt-by-prompt renderer walking any valid template; answer capture per type; touch targets ≥44pt hard floor (design defaults per ADR-0018) [PDD §5.2]
  - AC [CI]: renderer walks the full R-003 template in the web test env — every answer type renders; conditional branch shows/hides per prior answer; touch-target and type floors assert ADR-0018 tokens (≥48px targets, ≥18px body).
  - AC [device]: full template completion on physical iOS and Android; glove operation (DV-1, DV-2).
- R-006 Voice notes bound to the prompt being answered; native recording survives screen lock and backgrounding [PDD §5.2, §8.2]
  - AC [CI]: mocked native recorder — simulated 60s recording with mid-recording lock/background event yields exactly one complete op bound to the correct prompt.
  - AC [device]: real 60s recording with actual screen lock; audio playable (DV-5).
- R-007 Photo capture bound to prompt with device timestamp, GPS, compass heading in metadata [PDD §5.2]
  - AC [CI]: op schema rejects any of the three metadata fields missing; compression at the app-default quality preserves all three EXIF fields on a fixture image.
  - AC [device]: real capture carries real timestamp, GPS, and compass values (DV-6).
- R-008 Local-first persistence: every op + blob written to native filesystem and local op log before any network use; full session completable in airplane mode [PDD §8.4]
  - AC [CI]: with the network layer mocked off, the full R-003 template completes; every op + blob present and valid on the filesystem abstraction before any network use; zero network calls asserted.
  - AC [device]: entire template completed in airplane mode on hardware; all ops valid on disk (DV-7).
- R-009 Crash safety: app force-kill and relaunch mid-session loses zero completed ops; an interrupted blob write never yields a valid op [PDD §8.4]
  - AC [CI]: interrupted-write fixture yields absent-or-incomplete op, never valid-op-with-corrupt-blob; write order (blob → fsync → op commit) asserted; op-log replay after simulated process death reconstructs N ops with session resumable at prompt N+1.
  - AC [device]: real force-kill mid-session; relaunch shows N ops, resumable at prompt N+1 (DV-8).
- R-010 Live completeness meter: required captured vs outstanding, updated per op [PDD §5.2]
  - AC [CI]: meter equals fixture-precomputed required-captured/outstanding counts at three named checkpoints of a scripted R-003 walk; reaches complete only when all required answered or skip-documented.
- R-011 Skip-with-reason on required items: skip requires a documented reason, recorded as an op [PDD §5.2]
  - AC [CI]: skip submission with empty reason rejected at component level AND a skip op lacking reason text rejected by schema; skip op carries reason text and prompt ref.
- R-012 Free-form observations lane available at any point, captured as prompt-unbound ops [PDD §5.2]
  - AC [CI]: observation recorded mid-template appears as a valid prompt-unbound op in the log; completeness meter unaffected by its presence.
- R-014 Photo annotation and tagging: markup plus tags ("violation", "area of origin") on captured photos, stored as ops; original photo never modified [PDD §5.2, §7]
  - AC [CI]: annotated photo yields annotation op referencing the photo op; original blob checksum unchanged (fixture image).
  - AC [device]: annotate a real capture with gloves; original blob intact (DV-10).
- R-013 Assignment intake (manual entry for demo) + GPS verification: match (within configured radius, default 100m, config-tunable) → silent verified state; mismatch → confirm-or-update prompt; raw coordinates always logged regardless of source [PDD §5.1]
  - AC [CI]: with mocked coordinates, distance beyond the configured tolerance triggers confirm-or-update; both resolutions recorded; raw coords present on the session record in all paths (match, confirm, update).
  - AC [device]: real GPS acquisition on-site; verify/mismatch behavior and acquisition-timeout handling (DV-9).

## E02 — Sync & ingestion
- R-020 Idempotent batch op ingestion (POST /v1/sessions/:id/ops): dedupe by op UUID; same batch delivered twice → identical DB state; per-op receipt statuses [PDD §8.4]
- R-021 Receipt-confirmed local state: ops marked safe only on server ack; explicit "everything uploaded" UI state [PDD §8.4]
- R-022 Background drain: queued ops/media upload continues while app is backgrounded [PDD §8.2]
- R-023 Chunked resumable media upload: interrupted transfer resumes from offset, never restarts [PDD §8.6]
- R-024 Server persistence: ops → Postgres, blobs → S3; device timestamp and server-receipt timestamp both stored [PDD §7]
- R-025 Checksums verified on ingestion; EXIF/metadata preserved through any server processing [PDD §7]
- R-026 Phone/desktop conflict rules specified and enforced for post-capture edits (op-log ordering + last-reviewer-wins on review actions; capture ops immutable so never conflict) [PDD §8.4; ADR-0003]
- R-027 Assignment and pinned template pre-load to device on acceptance; session startable with zero connectivity from app launch [PDD §5.1]

## E03 — AI pipeline
- R-030 Transcription with fire-service custom vocabulary and word-level confidence output [PDD §5.3; ADR-0009]
- R-031 Extraction: transcript → template mapping targets via Bedrock, per active snapshot [PDD §5.3]
- R-032 Every AI output records model ID and prompt version [PDD §8.5]
- R-033 Stages discrete, stored, replayable: audio → transcript → extraction each persisted; re-run creates a new versioned Extraction, never overwrites [PDD §8.5]
- R-034 Uncertainty flagging: below-threshold confidence marks the field for review; no silent guesses [PDD §5.3]
- R-035 Gap detection: required mappings with no supporting evidence enumerated before review [PDD §5.3]
- R-036 Contradiction detection: conflicting evidence (e.g., stated direction vs photo compass metadata) flagged for review [PDD §5.3]

## E04 — Review & approval
- R-040 Review screen: extracted values with flags; tapping a field plays its source audio segment [PDD §5.4]
- R-041 Conversational editing: natural-language instruction → applied edit shown as diff → approve/reject; nothing applied unshown [PDD §5.4]
- R-042 Per-field and bulk approval; flagged fields excluded from bulk [PDD §5.4]
- R-043 Immutable audit trail: originals never mutated; every edit/instruction/approval recorded with actor and time [PDD §5.4, §7]

## E05 — Vendor integration (mock schema until E07 unblocks)
- R-050 Anti-corruption mapping layer: internal model → vendor schema; vendor schema swappable by config [PDD §8.7; ADR-0010]
- R-051 Submission lifecycle: approved/final marking, delivery status visible, retry + dead-letter + human-visible alert on failure [PDD §5.5]
- R-052 Evidence package export with all metadata and checksums intact [PDD §5.5, §7]
- R-053 Assignment intake pulled from the report system via the mapping layer (mock source until E07 binds the vendor) [PDD §5.1, §8.7]

## E06 — Template management platform (post-demo)
- R-060 Template versioning: published versions immutable; new version per change [PDD §6.2]
- R-061 Org overrides layered on platform base; base updates propagate where non-conflicting; conflicts surface for resolution [PDD §6.3]
- R-062 Lockability enforcement surfaced in domain language (never schema/field vocabulary at org tier) [PDD §6.3, §4-P4]
- R-063 Agent-assisted editing: intent → proposed diff → sandbox preview on device → approve; never direct mutation [PDD §6.4]
- R-064 Sign-off records for all template changes incl. on-behalf-of flow (review-and-accept before live) [PDD §6.5]

## E07 — Real template content (GATED: vendor NDA + data model)
- R-070 Vendor data model bound into R-050 mapping layer [PDD §5.5]
- R-071 Inspection base templates per occupancy type from vendor checklist structures; every required question carries a required_by standards citation [PDD §6.1]
- R-072 NFPA 921-aligned investigation template [PDD §6.1]
- Note: this epic's milestone validation includes vendor/SME review, not owner-only [front-door decision].

## E08 — Identity & tenancy
- R-080 Multi-tenant isolation platform → vendor → org → user in the data model from first migration (org_id on every tenant-owned table) [PDD §8.8]
- R-081 SSO (Microsoft Entra first) with email-based org discovery at login [PDD §8.8]
- R-082 Token expiry while offline never blocks capture; re-auth on reconnect without loss [PDD §7]
- R-083 Role model enforced across the three tiers (field user / org admin / platform admin) [PDD §3, §5.6]

## E09 — Evidence & ops hardening
- R-090 S3 Object Lock on evidence objects; versioned backups [PDD §7]
- R-091 Structured logging incl. client sync-queue state; remote log retrieval per device [PDD §8.9]
- R-092 Per-org feature flags [PDD §8.8]
- R-093 Org analytics: time per inspection, completeness rates, commonly skipped items [PDD §5.6]
- R-094 Retention schedules and legal-hold support on evidence and reports [PDD §7]

## Deliberate exclusions (audited; not omissions)
- Video capture: R-001 schema reserves the `video` answer type; capture implementation deferred post-demo [PDD §5.2].
- Voice-forward navigation: post-pilot enhancement; touch-first ships first [PDD §5.2].
- Multi-person scenes: post-v1; ADR-0003's op-log model is chosen partly so the data model does not preclude it [PDD §8.4].
- Template code-edition dimension: post-MVP per PDD §6.1.
- Proactive agent template suggestions: follows E06 usage data [PDD §6.4].
- MDM remote-wipe behavior for unsynced evidence: designed during pilot hardening [PDD §7].
- Client media compression policy: task-level decision inside R-007/R-023, not a requirement row [PDD §8.6].

Architecture conventions (binding, per ADRs): routes → services → repos; /shared zod schemas are the single type source; op log is append-only; evidence blobs on native filesystem client-side and S3 server-side; glossary vocabulary everywhere.
