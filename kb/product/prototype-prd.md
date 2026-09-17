# Prototype PRD — Blazestack Utilities capture slice
<!-- Budget: 300 lines. Owner file for THE CURRENT BUILD. Requirement IDs R-100..R-199 (own space; R-001..R-094 in prd.md are full-product context, not current scope). -->
<!-- STATUS: DRAFT (owner approval pending). Source of scope: Blazestack prototype doc + comment threads (2026-09-17), owner scope calls in the Phase C working session. -->
<!-- Precedence: this document defines the current build. prd.md provides context and vision; where the two differ for prototype work, THIS wins. Accepted ADRs bind both unless a row here says otherwise. -->

## What the prototype is
A capture tool. The investigator opens it in a phone browser, walks three Blazestack Utilities subsections one prompt at a time, answers by voice, photo, or tap, and the AI parses those inputs into proposed values for Blazestack's case fields. The investigator reviews and corrects the values, confirms the section, and advances. **The prototype ends at delivered fields — structured JSON in Blazestack field shapes.** Prose generation, report assembly, and downstream workflow are Blazestack's and are explicitly out of scope.

Purpose: feedback and testing with Blazestack. Not the pilot build.

## Scope boundaries (deliberate, per owner + comment threads)
- **Video: out.** Their comment [b]: "for this proto-type, we do NOT have to include video." Schema reserves the type; no capture.
- **Prose generation: out.** Blazestack generates polished prose from field values; duplicating it is exactly the overlap ADR-0019 forbids.
- **Live API delivery: out.** Output is JSON in their field shapes; no dependency on their API, auth, or engineering time.
- **Native shell, offline-first, crash safety: out of the prototype, retained for pilot.** Browser delivery per ADR-0020; storage is an adapter so the native implementation slots in without a rewrite.
- **Voice navigation and a talking agent: out.** Voice answers, dictation, and spoken corrections only.
- **Template management, SSO, multi-tenancy depth, GPS verification: out.**

## Requirements

### Contracts (wave 0)
- R-100 CaptureTemplate schema (zod, /shared): sections → fields → answer types (voice | photo | selection | text; `video` reserved, no capture) → required flag → conditional show-if → **repeating groups** → option lists → per-field mapping key to the Blazestack field name.
  - AC: schema compiles strict; R-102 template validates; four invalid fixtures (unknown answer type, dangling show-if target, repeating group with no item schema, field with no mapping key) each rejected with an error naming the offending path.
- R-101 CaptureOp schema (zod, /shared): op UUID, session ref, field ref (incl. repeating-group instance index), op type (past-tense namespaced), device timestamp, payload ref + SHA-256.
  - AC: schema compiles; ops round-trip JSONL serialize→parse deep-equal; rejects a media op with no checksum; rejects a repeating-group op with no instance index.
- R-102 Seed template from Blazestack Utilities — Electrical Supply, Electrical Subpanels (repeating), Gas Utilities: every field, option list, and conditional from their data map, using **their** field labels and option values.
  - AC: validates against R-100; contains ≥1 conditional gate, ≥1 repeating group, ≥25 fields; the renderer consumes it as loader input only, with no template-specific code paths (pr-review enforced).

### Capture
- R-103 Prompt-by-prompt renderer: one field per screen, every answer type, per the ADR-0018 design contract. Token values resolve from CS-12; raw literals lint-denied.
  - AC: renderer walks the full R-102 template in the web test env; every answer type renders; touch-target and type floors assert ADR-0018 tokens (≥48px targets, ≥18px body).
- R-104 Conditional logic: a field's show/hide state follows prior answers (their Yes/No gates).
  - AC: "Electrical service in place = No" hides the remaining Electrical Supply fields; "Did fire crews manipulate = Yes" reveals Explain; both assert against the R-102 fixture.
- R-105 Repeating groups: add and delete instances of a repeating section (Electrical Subpanel 1..n), each instance capturing the full field set independently.
  - AC: two subpanel instances captured; ops carry distinct instance indices; deleting instance 1 leaves instance 2's ops intact and correctly indexed.
- R-106 Voice answers bound to the field being answered; foreground recording with elapsed-time feedback. Op appended via CS-2; audio blob and checksum via CS-3.
  - AC: a simulated 45s recording yields exactly one complete op bound to the correct field, with a checksummed payload ref.
- R-107 Photo capture bound to the field, carrying device timestamp and GPS in metadata (compass omitted — unavailable in mobile browsers). Blob write and checksum via CS-3.
  - AC: op schema rejects a photo op missing timestamp or coordinates; client compression at the app-default quality preserves both EXIF fields on a fixture image.
- R-108 Text answers by keyboard or dictation (live speech-to-text into the field).
  - AC: dictated text lands in the field's op as text; the op is indistinguishable in schema from keyboard entry.
- R-109 Local-first buffering: ops and blobs persist locally before upload; a mid-session page reload loses zero confirmed answers. All writes via CS-1, CS-2, CS-3.
  - AC: 20 ops written, page reloaded, all 20 readable and valid; no direct storage primitive appears in the diff (gate 1).
- R-110 Completeness indicator: required captured vs outstanding for the active section, updated per op.
  - AC: the indicator equals fixture-precomputed counts at three named checkpoints of a scripted R-102 walk; reaches complete only when every required field is answered or marked unknown/unavailable.
- R-111 Mark unknown or unavailable and continue (their language for a documented gap), recorded as an op.
  - AC: a field marked unknown yields an op carrying the field ref and the reason value; the completeness indicator counts it as resolved, not answered.

### Sync (thin)
- R-112 Op and media upload, idempotent by op UUID; same batch delivered twice produces identical server state. All network via CS-5, queue via CS-4.
  - AC: duplicate batch ingestion leaves row counts and checksums unchanged.
- R-113 Upload state visible per section: queued / uploading / safe, using the ADR-0018 sync-state tokens.
  - AC: each state renders with icon + label (never colour alone); "safe" appears only after server acknowledgement.

### AI pipeline
- R-114 Transcription of voice answers with word-level confidence. Model invocation via CS-13.
  - AC: a fixture audio file yields a stored transcript with per-word confidence; the transcript artifact persists independently of any extraction.
- R-115 Extraction: transcript → proposed values for the template's mapped fields, per the active section.
  - AC: a fixture transcript covering Electrical Supply yields proposed values for ≥4 mapped fields; extraction runs against the stored transcript, never the raw audio.
- R-116 Every AI output records model ID and prompt version.
  - AC: transcript and extraction artifacts each carry a non-empty model id and prompt version; re-running extraction creates a new versioned artifact and never overwrites the prior one.
- R-117 Uncertainty flagging: below-threshold confidence marks the field for review rather than guessing; thresholds are config.
  - AC: a low-confidence fixture produces a flagged field; flagged fields are excluded from any confirm-all action.
- R-118 Option matching: an extracted value is matched against the field's option list; a near-miss is flagged with the suggested existing option rather than silently creating a new value.
  - AC: "pad mounted transformer" against an option list containing "Service lateral from a pad-mounted transformer" yields a flagged suggestion, not a new option; an exact match yields an unflagged value.
- R-119 User-added options: a value with no acceptable match is captured as a **proposed** option on the op, never silently merged into the shared list.
  - AC: a proposed option appears in the export marked as proposed, with the field's existing options unchanged.

### Review and confirm
- R-120 Section review screen: proposed field values with their flags; tapping a field plays the source audio segment that produced it.
  - AC: every proposed value traces to its source op; a value with no supporting evidence is shown as a gap.
- R-121 Correct a value by touch or by spoken instruction; a correction is shown before it is applied.
  - AC: a spoken correction produces a proposed change displayed for approval; rejecting it leaves the original value and records the rejection as an op.
- R-122 Confirm section, then advance: confirmed values are saved to the case and the next section opens.
  - AC: confirmation is blocked while any required field is unanswered and unmarked; confirmed values are immutable thereafter (corrections create new ops).

### Output
- R-123 JSON export in Blazestack field shapes, produced by the mapping module (CS-11); vendor field names and option values exist only inside it.
  - AC: the export validates against the Blazestack shape fixture; field names and option values match their data map exactly; repeating groups serialise as arrays; proposed options are marked; a vendor field name appearing anywhere outside the mapping module fails gate 1.

## Open — carried, not blocking wave 0
1. Option lists are vendor-sourced (their comment [j]): consumed from Blazestack and cached with the template rather than authored by us. Mechanism unconfirmed — until it exists, R-102 hard-codes their published values.
2. Their real option values differ from their document (their app shows "Bravo"; the doc says compass points). R-102 uses the app's values where the two disagree, and the difference is a question for them.
3. Near-duplicate detection also has to run server-side on ingestion, because an option proposed while offline cannot be matched against the cached list.
