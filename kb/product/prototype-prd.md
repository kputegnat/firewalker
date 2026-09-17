# Prototype PRD — Blazestack Utilities capture slice
<!-- Budget: 300 lines. Owner file for THE CURRENT BUILD. Requirement IDs R-100..R-199 (own space; R-001..R-094 in prd.md are full-product context, not current scope). -->
<!-- STATUS: DRAFT (owner approval pending). Source of scope: Blazestack prototype doc + comment threads (2026-09-17), owner scope calls in the Phase C working session. -->
<!-- Precedence: this document defines the current build. prd.md provides context and vision; where the two differ for prototype work, THIS wins. Accepted ADRs bind both unless a row here says otherwise. -->

## What the prototype is
**The thesis under test: non-interface capture is the primary intake method.** The investigator photographs and talks; the AI derives Blazestack's case-field values from those photographs and that audio. Dropdowns and keyboards exist as a fallback for what the AI cannot derive — never as the main path.

The two questions the prototype exists to answer:
1. **Can a photograph of a breaker panel, a meter, or a service entrance produce correct field values?** (visual derivation)
2. **Can an investigator's spoken narration be transcribed and mined for field values?** (narrative derivation)

And the operational question wrapping both: **can the app walk an investigator through gathering photos and audio in a way that actually populates the fields?**

The investigator opens it in a phone browser, is guided through capturing three Blazestack Utilities subsections, reviews what the AI derived, corrects what it got wrong, and confirms. **The prototype ends at delivered fields — structured JSON in Blazestack field shapes.** Prose generation, report assembly, and downstream workflow are Blazestack's and are explicitly out of scope.

Purpose: feedback and testing with Blazestack. Not the pilot build. Success is not "it works" — success is **knowing which fields derive reliably and which do not.**

## Scope boundaries (deliberate, per owner + comment threads)
- **Video: out.** Their comment [b]: "for this proto-type, we do NOT have to include video." Schema reserves the type; no capture.
- **Prose generation: out.** Blazestack generates polished prose from field values; duplicating it is exactly the overlap ADR-0019 forbids.
- **Live API delivery: out.** Output is JSON in their field shapes; no dependency on their API, auth, or engineering time.
- **Native shell, offline-first, crash safety: out of the prototype, retained for pilot** (ADR-0020). Storage is an adapter so the native implementation slots in without a rewrite.
- **Voice navigation and a talking agent: out.** Voice is an intake and correction channel, not a navigation one.
- **Template management, SSO, multi-tenancy depth, GPS verification: out.**

## Requirements

### Contracts (wave 0)
- R-100 CaptureTemplate schema (zod, /shared). A section carries **capture prompts** (what to photograph, what to narrate) and **target fields** (label, option list, mapping key to the Blazestack field name, and the evidence hints extraction uses). The relationship is **many-to-many: one capture may populate many fields; one field may draw on several captures.** Conditional show-if and repeating groups apply to both.
  - AC: schema compiles strict; R-102 template validates; five invalid fixtures (capture prompt with no target fields, field with no mapping key, dangling show-if target, repeating group with no item schema, unknown answer type) each rejected with an error naming the offending path.
- R-101 CaptureOp schema (zod, /shared): op UUID, session ref, capture-prompt ref (incl. repeating-group instance index), op type (past-tense namespaced), device timestamp, payload ref + SHA-256.
  - AC: schema compiles; ops round-trip JSONL serialize→parse deep-equal; rejects a media op with no checksum; rejects a repeating-group op with no instance index.
- R-102 Seed template from Blazestack Utilities — Electrical Supply, Electrical Subpanels (repeating), Gas Utilities: their field labels, option values, and conditionals as target fields, plus authored capture prompts that guide the photography and narration expected to populate them.
  - AC: validates against R-100; ≥25 target fields; ≥1 conditional gate; ≥1 repeating group; every target field is reachable from at least one capture prompt; the renderer consumes it as loader input only, with no template-specific code paths (pr-review enforced).

### Capture — photographs and narration first
- R-103 Capture-prompt renderer: one capture prompt per screen, **camera and microphone as the primary actions**, per the ADR-0018 design contract. Navigation is **non-linear** — any section, any prompt, in any order. Token values resolve from CS-12; raw literals lint-denied.
  - AC: renderer walks the full R-102 template in the web test env; every capture prompt offers photo and voice without additional navigation; a prompt in section 3 is reachable without completing sections 1–2; touch-target and type floors assert ADR-0018 tokens (≥48px targets, ≥64px primary, ≥18px body).
- R-126 **No modality is required.** A prompt is satisfiable by photographs alone, narration alone, both, or neither — field conditions decide. Darkness, rain, and smoke rule out photography; sirens and scene noise rule out narration; neither absence blocks progress.
  - AC: a section completes derivation with photo-only evidence, with audio-only evidence, and with a mix across prompts; no validation path requires a specific modality.
- R-127 **Evidence may arrive later and out of band.** Photographs taken on a separate camera import by file; narration recorded back at the vehicle or the station attaches to any prompt afterwards. Imported media carries its own EXIF and device timestamp, distinct from the import time.
  - AC: a DSLR-sourced file imports with its original EXIF timestamp preserved and its import time recorded separately; narration attached to a prompt an hour after that prompt's photographs produces a derivation drawing on both.
- R-128 **Capture now, file it later.** Recording is reachable from any screen; a capture made while the investigator is elsewhere in the case can be assigned to any prompt or section, or left unassigned for triage.
  - AC: audio recorded while section 3 is open, then assigned to a section 1 prompt, derives against section 1's target fields; an unassigned capture is listed for assignment and never silently dropped.
- R-129 **Photo selection for derivation, quality-ranked.** All photographs are retained as evidence; the investigator selects which go to derivation, multi-select, defaulted to the highest-scoring. A client-side score (sharpness by Laplacian variance, plus exposure) is computed at capture and on import. The score **orders and advises; it never excludes.**
  - AC: 25 photographs on one prompt present ranked by score with the top-scoring preselected; the investigator can select any subset including a low-scoring frame; a below-threshold capture raises a retake prompt at capture time that is dismissible; no photograph is ever withheld from selection.
- R-130 **Narrate while reviewing photographs.** The recorder is available while browsing a prompt's photographs, and the record marks which photograph was on screen for each span of the audio.
  - AC: a recording made while moving through three photographs yields view-correlation spans resolving to those photo ops; derivation receives the correlation alongside the transcript.
- R-104 Guided photography: each capture prompt states what to photograph and why, and accepts multiple photographs before advancing. Blob write and checksum via CS-3.
  - AC: three photographs captured against one prompt yield three ops sharing that prompt ref, each with its own checksum; op schema rejects a photo op missing device timestamp or coordinates.
- R-105 Spoken narration bound to the capture prompt; foreground recording with elapsed-time feedback. Op appended via CS-2; audio blob and checksum via CS-3.
  - AC: a simulated 45s recording yields exactly one complete op bound to the correct capture prompt, with a checksummed payload ref.
- R-106 Conditional logic: a capture prompt's or field's show/hide state follows values already established.
  - AC: "Electrical service in place = No" suppresses the remaining Electrical Supply prompts and fields; "Did fire crews manipulate = Yes" reveals Explain; both assert against the R-102 fixture.
- R-107 Repeating groups: add and delete instances of a repeating section (Electrical Subpanel 1..n), each instance capturing independently.
  - AC: two subpanel instances captured; ops carry distinct instance indices; deleting instance 1 leaves instance 2's ops intact and correctly indexed.
- R-108 Local-first buffering: ops and blobs persist locally before upload; a mid-session reload loses zero captures. All writes via CS-1, CS-2, CS-3.
  - AC: 20 ops written, page reloaded, all 20 readable and valid; no direct storage primitive appears in the diff (gate 1).
- R-109 **Completeness is measured in target fields resolved, not prompts captured.** Because no modality is required and evidence arrives out of order, "how much is captured" is not a meaningful number; "how many fields still have no value" is. Reported per section and for the case.
  - AC: the indicator equals fixture-precomputed resolved/outstanding counts at three checkpoints of a scripted R-102 walk; adding evidence that derives two further fields decreases outstanding by exactly two; a field marked unavailable counts as resolved, not derived.
- R-110 Mark unavailable and continue (their language for a documented gap), recorded as an op — available on a capture prompt and on an individual target field.
  - AC: a prompt or field marked unavailable yields an op carrying its ref and reason value.

### Sync (thin)
- R-111 Op and media upload, idempotent by op UUID. All network via CS-5, queue via CS-4.
  - AC: duplicate batch ingestion leaves row counts and checksums unchanged.
- R-112 Upload state visible: queued / uploading / safe, using the ADR-0018 sync-state tokens.
  - AC: each state renders with icon + label (never colour alone); "safe" appears only after server acknowledgement.

### Derivation — the thesis under test
- R-113 Transcription of narration with word-level confidence. Model invocation via CS-13.
  - AC: a fixture audio file yields a stored transcript with per-word confidence; the transcript artifact persists independently of any derivation.
- R-114 **Visual derivation: photographs produce proposed field values.** Images are submitted to a vision model with the section's target fields and their option lists; the model proposes values for the fields the image can support.
  - AC: a fixture breaker-panel photograph yields proposed values for at least breaker counts and tripped state; a fixture meter photograph yields a proposed meter number; a photograph supporting no target field yields zero proposals rather than guesses.
- R-115 **Narrative derivation: transcripts produce proposed field values** for the section's target fields.
  - AC: a fixture transcript covering Electrical Supply yields proposed values for ≥4 mapped fields; derivation runs against the stored transcript, never the raw audio.
- R-116 **Provenance on every proposed value:** which photograph, or which audio segment and words, produced it.
  - AC: every proposed value resolves to at least one source op; a value whose provenance cannot be resolved is rejected rather than shown.
- R-117 Every AI output records model ID and prompt version; re-running derivation creates a new versioned artifact and never overwrites the prior one.
  - AC: transcript, visual-derivation, and narrative-derivation artifacts each carry a non-empty model id and prompt version; a re-run leaves the prior artifact byte-identical.
- R-118 Uncertainty flagging: below-threshold confidence marks the field for review rather than guessing; thresholds are config.
  - AC: a low-confidence fixture produces a flagged field; flagged fields are excluded from any confirm-all action.
- R-119 Option matching: a derived value is matched against the field's option list; a near-miss is flagged with the suggested existing option rather than silently creating a new value.
  - AC: "pad mounted transformer" against a list containing "Service lateral from a pad-mounted transformer" yields a flagged suggestion, not a new option; an exact match yields an unflagged value.
- R-120 User-added options: a value with no acceptable match is captured as a **proposed** option, never silently merged into the shared list.
  - AC: a proposed option appears in the export marked as proposed, with the field's existing options unchanged.
- R-121 **Derivation instrumentation** — for every target field, record: derived visually, derived from narration, derived from both, or not derived; the confidence; and whether the investigator accepted, corrected, or entered it manually.
  - AC: a completed session exports a per-field derivation record covering every target field; the record distinguishes all four derivation sources and all three investigator outcomes.

### Review and confirm
- R-122 Section review: derived values with their flags and provenance; tapping a value opens its source photograph or plays its source audio segment.
  - AC: every derived value traces to its source op; a target field with no supporting evidence is shown as a gap, not left blank.
- R-123 Correct or enter a value — by touch, by keyboard, or by spoken instruction. **Manual entry is the fallback path for anything not derived.** A correction is shown before it is applied.
  - AC: a spoken correction produces a proposed change displayed for approval; rejecting it leaves the original value and records the rejection; a manually entered value is marked as manual in the R-121 record.
- R-124 Confirm section, then advance.
  - AC: confirmation is blocked while any required target field is unresolved; corrections after confirmation create new ops rather than editing values.

### Output
- R-125 JSON export in Blazestack field shapes, produced by the mapping module (CS-11); vendor field names and option values exist only inside it.
  - AC: the export validates against the Blazestack shape fixture; field names and option values match their data map exactly; repeating groups serialise as arrays; proposed options are marked; a vendor field name appearing anywhere outside the mapping module fails gate 1.

## Open — carried, not blocking wave 0
1. **Which fields are visually derivable is genuinely unknown.** Breaker counts, tripped position, meter numbers, and overhead-vs-lateral service look tractable; wiring type (copper vs aluminum) and damage grading look hard. R-121 exists so the prototype answers this with data instead of opinion.
2. Option lists are vendor-sourced (their comment [j]) — consumed from Blazestack and cached with the template rather than authored by us. Mechanism unconfirmed; until it exists, R-102 hard-codes their published values.
3. Their real option values differ from their document (their app shows "Bravo"; the doc says compass points). R-102 uses the app's values where the two disagree.
4. Near-duplicate detection must also run server-side on ingestion, because an option proposed while offline cannot be matched against the cached list.
