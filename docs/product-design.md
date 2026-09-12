# Field Capture Platform for Fire Investigation & Inspection
## Product Design Document

**Version:** 0.1 (Draft)
**Date:** September 2026
**Status:** Pre-development — captures full product design as discussed and agreed to date

---

# 1. Executive Summary

This product is a mobile-first, AI-assisted field data capture platform for fire investigators and fire inspectors. It replaces scribbled notes, ad hoc audio recordings, and exposed laptops/iPads on scene with a guided, prompt-based workflow on the phone the user already carries. Personnel answer structured prompts using voice, photos, and quick selections; the platform transcribes, extracts, and organizes that raw capture into report-ready data; and the user reviews and approves the result — conversationally, if they choose — before it flows into their department's report software.

The initial go-to-market motion is a partnership with an established fire report software vendor who approached with a "can it be done" mandate and will supply the target data model and industry-standard workflow requirements. The likely trajectory is acquisition by that vendor, and the product and codebase are designed with that outcome explicitly in mind: clean architecture, auditable AI, and deployability into the vendor's AWS environment are treated as product features, not afterthoughts.

The three differentiating capabilities, in priority order:

1. **The workflow template engine** — industry standards (NFPA 921/1033 for investigations; IFC/NFPA 1 and referenced standards for inspections) encoded as versioned, org-customizable prompt scripts that guarantee completeness of capture.
2. **Completeness and gap detection** — the platform knows what a defensible report requires and tells the user, on scene, what is still missing.
3. **Auditable AI review** — the AI never silently changes what the investigator said. Originals are preserved, every transformation is staged and replayable, uncertainty is flagged rather than guessed, and a human approval gate makes the final output the investigator's statement, not the AI's.

Transcription and text polishing are commodity capabilities and are treated as such. The defensible value is in the workflow encoding, the evidentiary discipline, and the review experience.

---

# 2. Problem Statement

Fire personnel gather information on scene under hostile conditions — weather, gloves, noise, poor light, no connectivity — and their current tools fail them in three ways.

**Capture friction.** The realistic options today are handwritten notes (slow, lossy, illegible later), free-form audio memos (undifferentiated, requiring manual transcription and reorganization), or bringing the full report software into the field on an iPad or laptop (exposing expensive, fragile hardware to the elements and forcing desk-shaped software into field-shaped work).

**Completeness risk.** The investigator or inspector must personally remember everything a defensible report requires. A missing required observation discovered back at the office may be unrecoverable — the building may be released, altered, or demolished. In litigation and insurance contexts, gaps are not just inefficiencies; they are impeachment material.

**Rework.** Whatever is captured in the field must then be manually transcribed, reorganized, and re-entered into the report software. This duplicated effort is where transcription errors, omissions, and delays enter the record.

The solution is to move the report's *information requirements* into the field as a guided capture workflow, let the phone do what phones are good at (voice, camera, GPS, offline storage), and let AI do the transformation work — under human review — so that data is captured once, completely, and flows to the report system without re-entry.

---

# 3. Users and Roles

The platform serves three human tiers plus the vendor relationship. A governing principle applies across all of them: **every audience gets consequences, not mechanisms.** Users see what things mean for their work in their own vocabulary; the machinery (schemas, fields, mappings, model versions, confidence scores) is visible only to the platform tier.

**Field user (inspector / investigator).** Runs capture sessions on scene. Sees prompts to answer, a live completeness meter, and a review experience in plain language. Never sees extraction pipelines, confidence internals, or schema concepts. Design assumptions: gloved hands, bright sun and dark interiors, ambient noise, intermittent-to-zero connectivity, and a phone that may go in and out of a pocket mid-task.

**Org admin (fire marshal, chief, department admin).** Controls which workflows their department uses within allowed bounds: enables/disables optional questions, adds department-specific content, selects applicable code editions, and approves changes — including changes made on their behalf. Interacts entirely in fire-service language ("I need to know whether the kitchen has a hood suppression system"), never in system language ("this maps to custom_field_12"). Field names, schemas, and mapping tables are never surfaced at this tier.

**Platform admin (us / the vendor).** Owns base templates and standards mappings, manages tenants, performs on-behalf-of changes (with org sign-off), and is the only tier that ever sees the machinery: data model mappings, template internals, model and prompt versions.

**The report vendor.** Supplies the data model and workflow requirements, is the integration target, likely the acquirer, and possibly the host (their AWS environment). Structurally, the vendor is the top-level tenant: platform → vendor → org → user.

---

# 4. Product Principles

These principles were established during design and resolve most feature-level debates. They should be treated as binding unless deliberately revised.

**1. The workflow is the product; transcription is plumbing.** Speech-to-text and AI polish are commodities. Encoding what a complete, defensible capture looks like — and enforcing it in the field — is the moat.

**2. Evidence integrity above convenience.** Reports end up in litigation and insurance disputes. Original audio, raw transcripts, and original photos are preserved forever alongside every AI-derived version. The chain from "what the investigator said" to "what the report says" is auditable end to end. An AI that silently polishes statements is a cross-examination liability; an AI whose every edit is reviewed and approved, with originals retained, is defensible. The human approval gate is a legal posture, not just UX.

**3. Flag uncertainty; never guess.** A confident wrong detail ("14 gauge" vs. "12 gauge") is far worse than a visible gap. Low-confidence transcription or extraction is marked for human resolution, always.

**4. Consequences, not mechanisms.** Each audience sees meaning in its own vocabulary. Inspectors see what to capture next. Marshals see what their people will be asked and what reports will contain. Only the platform tier sees schemas, mappings, and model machinery. Even compliance guardrails speak in domain terms: "this question is required by state fire code," never "this field is required by the data model."

**5. Offline-first is non-negotiable.** The network is never in the critical path of capture. Everything writes locally first and syncs when connectivity allows, with explicit receipt confirmation and a visible "everything is safely uploaded" state. User confidence that nothing was lost is itself a feature.

**6. Config, not code.** Per-customer variation is data (templates, overrides, flags, branding accents), never per-customer builds. Per-vendor variation is a branding wrapper on one shared codebase, never a functional fork.

**7. Boring, consistent, documented.** Every technical decision defaults to the predictable option, written down. The codebase will be read by the vendor's engineers during due diligence; "clean, obvious, boring" is what tips build-vs-buy toward buy.

---

# 5. Feature Specification

Features are organized by the journey the data takes: pre-visit → on-site capture → AI processing → review and approval → integration → administration.

## 5.1 Pre-Visit Setup

**Assignment intake.** Jobs (address, occupancy type, incident number, assignment metadata) arrive from the report software via integration, or by manual entry for walk-up work. The assignment is the primary source of truth for the address — in most cases it exists before anyone arrives on scene, and re-entering it is both friction and a typo risk in a legal document.

**Address handling: assignment pre-fill → GPS verify → assisted manual fallback.** GPS is verification, never the source of truth. On session start, the app captures coordinates and compares them to the assignment address. A match produces a silent confirmation ("location verified") — which is itself a useful evidentiary fact. A mismatch produces a prompt: "You appear to be at 412 Oak St, but this assignment is for 380 Oak St. Confirm you're at the right location or update the address." This catches wrong-address reports, which occur when personnel run multiple jobs in a day.

GPS cannot be the primary source because reverse geocoding fails exactly where fire work happens: rural properties, large commercial lots where the vehicle parks far from the entrance, and multi-unit buildings where GPS resolves the parcel but not "Unit 4B" — and the unit designation is often the legally significant element. The place the user stands is also not always the incident address (staging areas, adjacent exposures, investigating from an alley). Urban-canyon and indoor accuracy can be off by a full lot width.

Manual entry, when needed, is assisted: type-ahead against a geocoding service, with GPS pre-filling a *suggestion* the user confirms rather than a value silently accepted.

Regardless of address source, raw coordinates at time of capture are always logged as metadata — "the investigator was physically present at these coordinates at this time" is exactly the kind of fact that holds up later.

**Workflow selection.** Inspection type or investigation type determines the prompt script. The applicable template (and its pinned version — see §6) is resolved at session start.

**Offline pre-load.** On assignment acceptance (typically on station wifi), the workflow template, checklists, data-model mappings, and prior-visit history are cached to the device so the session runs with zero connectivity.

## 5.2 On-Site Capture

**Prompted step-by-step flow.** The app asks; the user answers — by voice note, photo, video, or quick-tap selection. Each answer is bound to the specific prompt it addresses. Voice notes are tied to prompts, not accumulated as one long undifferentiated recording; this binding is what makes downstream extraction reliable and review auditable.

**Photo and media capture with automatic metadata.** Every photo carries timestamp, GPS coordinates, compass heading, and the prompt it belongs to. Quick annotation tools allow markup and tagging ("area of origin," "V-pattern," "violation").

**Free-form capture lane.** An "other observations" channel exists for anything outside the script, so the guided structure never suppresses an observation that doesn't fit a prompt.

**Live completeness meter.** A persistent view of required items captured versus outstanding. This is the on-scene expression of the completeness guarantee and a centerpiece of the product's value.

**Skip-with-reason.** A required item may be skipped, but only with a documented reason. In litigation contexts, a recorded "why" for every gap matters.

**Field-conditions design.** Large touch targets, voice-forward navigation, high-contrast display for bright sun and dark interiors, and behavior that tolerates the phone sleeping or being pocketed mid-task (native audio capture continues across screen lock — a wrapper-level capability; see §8).

**Fully offline operation.** All capture writes locally and immediately; sync happens opportunistically in the background with explicit per-item receipt confirmation (see §8.4).

## 5.3 AI Processing Pipeline

Processing happens server-side after sync; it is not an offline requirement, since review can happen back at the station.

**Transcription** tuned for noisy environments, with a maintained custom vocabulary of fire-service terminology ("spalling," "alligatoring," "arc mapping," and the broader NFPA lexicon). Word-level confidence scores are required from the engine, as they feed uncertainty flagging.

**Extraction pass.** An LLM maps transcript content to the report data model's fields, per the active template's mappings.

**Uncertainty flagging.** Low-confidence transcriptions or extractions are marked for review — never silently guessed. The review UI presents these as questions to the human ("audio unclear — did you say 14 gauge or 12 gauge?").

**Contradiction detection.** Conflicts between captured evidence are flagged (e.g., a voice note says "north wall" while photo compass metadata indicates a south exposure).

**Gap detection.** Required fields with no supporting captured evidence are identified before review, complementing the in-field completeness meter.

**Pipeline discipline.** Every stage — audio → transcript → extraction → field values — is a discrete, stored, replayable step, with the model and prompt version recorded for every AI output (see §8.5). "The AI said so" must always resolve to *which* AI, *when*.

## 5.4 Review and Approval

**Side-by-side chain of evidence.** The review experience presents original audio and raw transcript alongside AI-extracted field values. Tapping a field plays the source audio that produced it — the chain of evidence made visceral and inspectable.

**Conversational editing.** The user directs changes in natural language ("change the origin description to say northeast corner"); the AI applies the edit and shows a diff. Nothing is applied without being shown.

**Approval gates.** Per-field approval or bulk approval with flagged items held back. Approval is what converts AI-assisted output into the investigator's own statement — the legal posture depends on this gate.

**Immutable audit log.** Original captures are preserved permanently. Every AI edit, every human instruction, and every approval is recorded with who and when.

## 5.5 Integration and Output

**Push to report software** via the vendor's data model through a dedicated mapping layer (anti-corruption layer; see §8.7). The internal capture model is ours; translation to the vendor's schema happens at the boundary.

**Evidence package export** with all metadata intact.

**Round-trip status.** The user and the org can see when the report software accepted the data. Failed or partially accepted deliveries are queued, retried, dead-lettered when necessary, and surfaced to a human — a report that silently fails to land is unacceptable.

**Delivered-content protection.** Data delivered to the vendor arrives marked as approved/final and exempt from further silent transformation. The vendor's existing AI grammar-correction feature must not invisibly mutate investigator-approved content downstream; this is a required clause of the integration specification.

**Multi-vendor abstraction (future).** Capture once; map to any report platform's schema. The mapping layer makes this a per-vendor configuration exercise rather than a rebuild.

## 5.6 Administration

**Org and role management** across the three tiers (field user, org admin, platform admin), with vendor as top-level tenant.

**Workflow template administration** including the agent-assisted editing experience (§6.4) and the sign-off flows (§6.5).

**Analytics.** Time per inspection, completeness rates, commonly skipped items — the last of which also feeds proactive template improvement suggestions (§6.4).

---

# 6. The Workflow Template System

This is the core intellectual property of the product and warrants its own section.

## 6.1 Template Structure

A workflow template is a versioned document defining sections, prompts, answer types (voice, photo, selection, free text), required/optional status, conditional logic (e.g., occupancy-dependent branches), and mappings to the report data model. Templates are grounded in industry standards:

**Investigations.** NFPA 921 (Guide for Fire and Explosion Investigations) is the near-universal methodological reference — it defines the scientific-method approach, terminology, and what a defensible investigation covers: scene documentation, origin determination, cause analysis, and evidence handling. NFPA 1033 defines investigator qualifications. Critically, 921 is a *guide*, not a checklist: it says what a competent investigation addresses, not the order of prompts. This means there is a strong skeleton to build from and freedom in workflow design — and because courts effectively treat deviation from 921 as impeachable, a workflow that is "921-aligned by construction" is a credible and marketable claim.

**Inspections.** Requirements originate in adopted codes — the International Fire Code or NFPA 1 — plus referenced standards such as NFPA 25 (water-based suppression systems) and NFPA 72 (alarms). Standardized in source, fragmented in practice: which code edition applies is a state/local adoption decision, jurisdictions amend freely, and checklists vary by occupancy type (assembly, educational, high-hazard, residential) and department practice. Two neighboring counties can inspect the same restaurant against different editions with different amendments.

This fragmentation is not a bug in the product model — it is the reason the template engine and agent-assisted editing are valuable at all. Platform base templates map to the standards (a 921-aligned investigation workflow; inspection workflows per occupancy type keyed to IFC/NFPA 1 editions), and the org override layer absorbs exactly the variation that actually exists: local amendments, department preferences, edition selection.

The vendor has almost certainly codified this variation already — their report software must handle it. Their workflow requirements are effectively pre-digested industry standards; we request their inspection checklist structures per occupancy type alongside the data model rather than deriving templates from the codes ourselves.

**Code edition dimension.** Editions revise on cycles (NFPA 921 roughly every 3–4 years; IFC every 3). Template versioning will eventually need an "edition" dimension: a department moving from IFC 2021 to IFC 2024 is a template migration event. Not an MVP concern, but it slots into the versioning machinery below.

## 6.2 Versioning, Pinning, and Snapshots

**Every template change creates a new version.** Published versions are immutable.

**Reports pin to the version at capture start.** A session begun under v12 finishes under v12, even if v13 publishes mid-session; the app informs the user a newer workflow exists for their *next* job. Mid-capture template swaps are a completeness-tracking nightmare and an evidentiary mess, and are prohibited.

**Question snapshots are embedded in the report record — not merely referenced.** At capture time, the full question text, ordering, and mappings are copied into the report itself, deliberately redundant with the version pointer. Rationale:

- The report becomes self-contained. When subpoenaed three years later, proving what was asked does not require the template service to be alive and queryable — the record itself carries "the investigator was asked exactly this, and answered exactly this."
- It survives platform migrations, vendor changes, and our own schema refactors.
- It protects against the subtle failure mode where a "minor wording fix" is improperly applied to a published version. Even a versioning-discipline failure cannot retroactively alter what a past report claims was asked.

The version pointer is retained alongside the snapshot for operational purposes: analytics, and answering "which reports were captured under the flawed v12 template" when a workflow defect is discovered. **Snapshot for evidence; version pointer for operations.**

## 6.3 Permission Tiers and Customization Bounds

Three tiers of control:

1. **Platform admin** owns base templates and standards mappings, pushes updates, and can act on behalf of orgs.
2. **Org admin** enables/disables and customizes within allowed bounds, in domain language only.
3. **Field user** runs workflows; personal display preferences at most; no structural control.

**Lockable vs. configurable is explicit per question — metadata on the template, not policy by convention.** The platform template declares which items orgs may disable, which they may reword, and which are locked (statute-driven, or contractually required by the vendor's data model). When an org admin attempts to disable a code-required item, the agent responds as a compliance advisor, in domain terms: "These questions support a code-required item. I can hide them, but the report may be non-compliant for commercial occupancies. Want me to disable them only for residential workflows instead?"

**Org customizations are layered as overrides on the platform base — a merge model.** When a base template used by many orgs is updated, the update flows through automatically where it does not conflict with org overrides; conflicts surface to the org admin (or the agent) for resolution. This propagation model is designed early because retrofitting it after orgs have forked templates freely is painful.

## 6.4 Agent-Assisted Template Editing

Template editing is exactly the kind of task that kills adoption when it requires a form-builder UI; a fire marshal will not learn a drag-and-drop schema editor, but "add a section for food truck inspections with the propane system checks" is something they would actually say.

**The agent is a translator between intent in fire-service language and configuration in system language.** It has real context: the vendor's data model, the existing template structure, and the industry standards. So a request is not blind generation — the agent proposes questions grounded in NFPA language, matches the phrasing style of the rest of the template, and maps new questions to the schema silently.

**Diff-and-approve, never direct mutation.** The agent proposes; the admin sees exactly what will change, previewed as it will appear on the inspector's phone; approval is "yes, ask my people this" — a content decision, not a technical one. The template is the compliance instrument, so silent application is prohibited.

**When mapping is not clean** — a new question has no home in the vendor's data model — the marshal still never sees a technical problem. Two resolution routes: the agent stores it as supplemental data flowing into the report's narrative/attachments section (the information is captured and appears in the report; done); or, if it genuinely requires vendor-side schema work, that routes as a task to the *platform* tier while the marshal sees at most "this one will appear in the report notes for now."

**Proactive improvement.** With usage data, the agent can propose refinements: "Inspectors skip the roof-access question 80% of the time on strip-mall occupancies — want me to make it conditional?" Templates improve themselves under human approval. A static form builder can never do this; it is a moat feature. It also converts a vendor support cost (customers requesting template customizations) into a self-serve capability — a direct pitch point.

**Sandbox and rollout.** Changes are drafted, previewed (the admin can run the modified workflow on their own phone in a sandbox), then published to the department; optionally piloted personally ("try on my next inspection") before department-wide release.

## 6.5 On-Behalf-Of Changes and Sign-Offs

**On-behalf-of changes are never silent.** When the platform admin modifies an org's template — even at the org's request — the org admin receives a review-and-accept step before it goes live. This protects both sides: the org cannot later claim unauthorized changes, and the platform holds a signed acceptance record.

**Exception: compliance-driven pushes.** When a code change mandates a new question everywhere, the model is accept-by-deadline rather than accept-to-activate, with clear notification.

**Sign-offs are audit records**: who proposed, who approved, when, and the exact diff. This mirrors how fire departments already operate — SOPs change through documented approval, not casual edits — so it matches their mental model and reads well in procurement review.

**Delegation is explicit and revocable.** "Just manage our templates for us" (common for small departments without admin capacity) is a granted, recorded permission, never an assumed default.

The agent operates *within* the requesting user's tier and routes proposals into the sign-off flow — never around it.

---

# 7. Evidence Integrity, Compliance, and Records

**Chain of evidence.** Originals (audio, photos, raw transcripts) are preserved permanently. Every derived artifact (polished transcript, extracted values, edits) exists alongside — never instead of — its source. SHA-256 checksums are computed at capture time so alteration can be disproven later; nearly free at write time, impossible retroactively. EXIF/metadata is provably preserved through any compression pipeline — compression must never strip timestamps or GPS.

**Clock discipline.** Device timestamps and server-receipt timestamps are both recorded; neither alone is trusted for the evidentiary timeline, since phone clocks drift and devices sit offline for hours.

**Write-once storage semantics** for evidence (S3 Object Lock or equivalent), versioned backups, and eventual legal-hold support are designed in from the start.

**Records law.** Department reports are public records: FOIA/state open-records requests, retention schedules, and legal holds shape storage and deletion behavior. Procurement will ask.

**Security posture.** Government customers will expect SOC 2, clarity on data residency, and possibly CJIS-adjacent handling where arson investigations touch law enforcement data. A lightweight security architecture document is started now — it seeds both the SOC 2 story and the vendor's due-diligence packet. Encryption at rest on device (native filesystem plus OS keychain), TLS in transit, AI credentials server-side only (inside AWS, Bedrock access is via IAM roles — no API keys to manage).

**AI liability framing.** The human-approval gate is the legal position: the approved output is the investigator's statement. Terms-of-service language and E&O insurance are open business items (§13). The product-side contribution is architectural: originals preserved, transformations staged and versioned, uncertainty flagged, approval recorded.

**MDM realities.** Managed app config compatibility, tolerance of per-app VPNs, and — importantly — remote-wipe behavior that does not destroy unsynced evidence. What "wipe" means for the local evidence store is a designed decision, not an accident.

**Offline session behavior.** Auth tokens expiring while the device is offline for hours must never block capture; the app continues capturing and re-authenticates on reconnect without loss.

---

# 8. Technical Architecture

## 8.1 Stack

| Layer | Choice | Rationale |
|---|---|---|
| Mobile app | React + TypeScript + Vite, wrapped in **Capacitor** | One web codebase with native guarantees; see §8.2 |
| OTA updates | Capgo (or Appflow) | JS/UI changes deploy in seconds without app-store cycles |
| Backend | Node/TypeScript (Fastify or NestJS) on ECS Fargate | One language across the monorepo |
| Database | PostgreSQL (RDS) | Boring, universal, present in GovCloud |
| Object storage | S3 (Object Lock for evidence) | Write-once retention fits chain-of-evidence |
| Queue | SQS | Drives pipeline workers |
| AI — extraction | Amazon Bedrock (Claude) | Inside the vendor's compliance boundary; prompts/outputs not used for training |
| AI — transcription | Amazon Transcribe first; self-hosted Whisper as fallback track | Custom vocabulary + word-level confidence; both deployable in gov cloud |
| Infrastructure | Terraform from the first resource | Deployability into vendor environment is a product feature |
| CI/CD | GitHub Actions with OIDC federation to AWS | No long-lived cloud keys anywhere |

**Boring-dependency rule:** Postgres, S3-compatible storage, Redis if needed, standard queues — all of which exist in AWS GovCloud and Azure Government. Every exotic managed service is a portability landmine; the small convenience loss buys large optionality, which matters given the hosting scenarios in §9.

**Monorepo layout:**

```
/app        — Capacitor client
/api        — HTTP service (routes → handlers → services → repos)
/pipeline   — SQS workers (transcribe, extract, submit)
/shared     — zod schemas, domain types, constants
/infra      — Terraform
/docs       — ADRs, glossary, runbooks
```

## 8.2 Why Wrapped-Native from the Start (Not Pure PWA)

A pure PWA was evaluated and is technically capable of the demo (camera/mic via getUserMedia, offline shell via service worker, IndexedDB storage, installable, URL-distributed). But three iOS realities make it unacceptable for real evidence — and since demo will lead to pilot quickly, we wrap from day one rather than under pilot deadline pressure:

1. **Storage eviction.** Safari can evict IndexedDB under storage pressure; `navigator.storage.persist()` helps but Apple guarantees nothing. Any nonzero chance of silent loss of unrepeatable scene evidence (the building may be demolished next week) is a liability, not a bug.
2. **No background sync on iOS PWAs.** Uploads halt when the app closes; an inspector who pockets the phone and drives back has synced nothing.
3. **Recording dies on screen lock.** A native layer keeps recording; a PWA cannot reliably.

**The Capacitor + OTA architecture dissolves the iteration-speed objection:** web code inside the native shell still updates over the air in seconds; native rebuilds occur only when plugins or the shell change, which is rare after setup. Roughly 90% of PWA iteration speed with 100% of native guarantees.

**Native from day one for the risky pieces:** capture blobs to the native filesystem (never IndexedDB for evidence), native audio recording (lock-screen survival), native background upload, Capacitor plugins for camera/GPS.

**Distribution:** TestFlight for iOS (for a government software vendor, a properly provisioned TestFlight build signals "ships real deployable software" — part of what "can it be done" means to them), internal track/APK for Android, and Apple Business Manager / managed Google Play for department MDMs later. Same binary in all channels.

**Week-one plumbing:** Apple Developer enrollment (approval lags — start immediately), Mac build environment or cloud build service, Android keystore, TestFlight group for the vendor, OTA channel wired.

## 8.3 Core Schemas (Defined Before Any UI)

Two schemas anchor the entire system; everything else consumes their shapes:

1. **Workflow template format** — sections → prompts → answer types → required flags → conditional logic → data-model mappings → lockability metadata.
2. **Capture operation format** — the append-only op log entry: client-generated UUID, device timestamp, prompt reference, payload reference, session reference.

Both live in `/shared` as zod schemas from which all TypeScript types derive.

## 8.4 Offline-First Sync

- **App shell and assignment pre-load** cached before leaving connectivity.
- **Local-first capture:** every answer, photo, and audio blob writes to the native filesystem and a local op log immediately; the network is never in the capture path.
- **Append-only operation log, not state sync.** Captures are modeled as immutable operations with client UUIDs and device timestamps; server ingestion is idempotent by op UUID (the same op delivered twice produces one record). Retries cannot duplicate, ordering resolves cleanly, and the op log doubles as the audit trail — two requirements, one mechanism.
- **Receipt confirmation:** a local op is marked safe only after server acknowledgment; the UI shows an explicit "everything is safely uploaded" state.
- **Background drain** via native background upload; **chunked, resumable uploads** for large media on flaky networks (resume-from-offset, never restart).
- **Conflict rules** (same report touched from phone and desktop) are specified before the architecture is built, not after. Multi-person scenes (two investigators capturing into one report) are not v1, but the op-log model is chosen partly because it does not paint us into a corner there.

## 8.5 AI Pipeline

- **Discrete, stored, replayable stages:** audio → transcript → extraction → field mapping. Each stage's output persists. When models improve, extraction re-runs on old transcripts; when something looks wrong, the exact point where meaning changed is inspectable. This is chain-of-evidence made concrete.
- **Model and prompt versioning:** every AI output records which model and which prompt version produced it — the same discipline as workflow templates.
- **Custom vocabulary** for fire-service terminology, maintained as a first-class asset.
- **Transcription bake-off** (longest-lead-time technical risk; begins week 1): 20–30 genuinely dirty recorded clips — wind, engine noise, gloved handling, fire vocabulary — run against Amazon Transcribe, self-hosted Whisper, and one commercial API (e.g., Deepgram/AssemblyAI). Two evaluation axes: accuracy on our audio, and deployability inside the vendor's environment. An open-weights option may be strategically correct even at slightly lower accuracy. Word-level confidence output is a hard requirement.
- **Cost modeling:** transcription minutes + LLM tokens per report yields true unit cost, feeding pricing and the vendor conversation.
- **Prompts kept model-portable** — no deep dependence on one model's quirks, since gov-cloud regions lag commercial model availability.

## 8.6 Media Pipeline

Client-side compression policy (resolution/quality caps, AAC/Opus audio) decided early because it drives storage cost, upload time on one bar of LTE, and transcription quality. Metadata provably preserved through compression; checksums at capture (§7).

## 8.7 Integration: The Anti-Corruption Layer

The internal capture model is ours; a dedicated mapping layer translates to the vendor's schema at the boundary. This insulates us from vendor API churn, keeps multi-vendor capability real (a new vendor is a new mapping, not a rebuild), and is strategically important given acquisition dynamics. Delivery semantics are explicit: queue, retry, dead-letter, and human-visible alerts when a report fails to land. Delivered content is marked approved/final, contractually exempt from downstream silent transformation (§5.5).

## 8.8 Identity, Tenancy, and Apps

- **Multi-tenancy from day one**, even for a single-org pilot: org-scoped isolation retrofitted into a live evidence store is misery. Hierarchy: platform → vendor → org → user.
- **Auth matching government IT:** SSO (Microsoft Entra dominates the sector), MFA, roles aligned to the three tiers. Email-based org discovery at login ("enter your work email" → route to their SSO); field users never think about tenant codes. (Demo phase: hardcoded single user; SSO begins early because government identity integration always takes longer than planned.)
- **One app per vendor, one product underneath.** Departments are rows in the database — never builds. Vendors get a branded wrapper (app name, bundle ID, icon, splash, color tokens, backend endpoint) as build-time config over one shared codebase: a config directory, not a branch. Each vendor build points at that vendor's backend deployment, so vendor data never commingles even at infrastructure level — itself a selling point. One CI pipeline matrix-builds all variants, each with its own store track and OTA channel. **Hard rule: vendor builds never diverge functionally.** Vendor feature requests route through feature flags on the shared codebase; the moment builds fork functionally, multi-vendor economics collapse. Feature flags are also scoped per org, enabling pilots without forked builds.

## 8.9 Observability and Field Operations

Crash reporting and structured logs that include sync-queue state, so "inspector says photos vanished" is diagnosable; remote log retrieval for devices 200 miles away in a truck. A device-condition test matrix: old/low-storage/low-battery devices, airplane-mode transitions mid-capture, storage-full during evidence capture (a designed answer, not a crash). Physical test devices (a generation-old iPhone; a rugged-case Android) acquired immediately.

---

# 9. Hosting and Deployment

## 9.1 Environment Reality

The vendor runs in AWS and already ships an AI feature (grammar correction), which tells us: their legal and gov customers have accepted AI with an established provider posture; procurement language exists; and our pipeline can likely ride the same agreements. Open question to resolve precisely: **commercial AWS or GovCloud?** Commercial means all Bedrock models promptly available and minimal friction; GovCloud means a thinner, months-lagged model catalog (confirm required models exist before finalizing prompt engineering) and a verification process for our own dev/staging GovCloud account worth starting early. CJIS may independently force gov-grade handling where arson investigations touch law enforcement data.

Their grammar feature also calibrates their AI sophistication: a single-shot API call, not a pipeline. The gap between "we polish sentences" and our staged, replayable, uncertainty-flagging, human-approved architecture is precisely the gap that tips build-vs-buy toward buy. One caution inherited from it: verify their grammar AI does not silently rewrite originals — and regardless, our integration spec (§5.5, §8.7) prevents downstream mutation of approved content.

## 9.2 Deployment Models (Ascending Pain)

1. **Our SaaS in a gov-cloud region** under our account — easiest; satisfies data residency; we keep operational control and velocity.
2. **Single-tenant instance in the vendor's AWS account, operated by us** — their boundary, our ops; requires clear access agreements. 
3. **Vendor-operated deployment** — we ship signed, versioned containers; they apply releases. Velocity and debuggability suffer; app OTA channel still ours.
4. **Air-gapped/on-prem** — priced prohibitively if ever requested.

We push for 1 or 2: the vendor's real requirement is usually compliance boundary and data residency, not operating the software. Everything is containerized with Terraform from day one, so "run it in our environment" is a deployment exercise, not a rewrite. Deployment tiers are priced: vendor-hosted single-tenant costs meaningfully more than multi-tenant SaaS.

**Compliance inheritance:** deploying inside the vendor's authorized environment may let us inherit much of their FedRAMP/StateRAMP boundary rather than pursuing our own authorization — for a company this size, the difference between feasible and not. Ask directly what authorization they hold and whether our service can ride inside it. A gov-cloud-deployable system is also *more* acquirable, not less: "runs in your GovCloud tomorrow" is a due-diligence green light.

## 9.3 CI/CD Into the Vendor's Environment

Cross-account deployment is a standard AWS pattern; the friction level depends on the trust model their ops team accepts:

- **Option 1 — cross-account IAM (preferred; ask explicitly for a dedicated sub-account in their AWS Organization).** GitHub Actions authenticates via OIDC federation (no long-lived keys); assumes a tightly scoped deploy role limited to our resources; push-to-main → build → push image → update ECS → smoke test. Near-SaaS velocity inside their boundary; blast radius contained; auditors content.
- **Option 2 — artifact handoff.** We build, test, scan, and publish signed images to a shared ECR repo plus versioned Terraform/task definitions; their pipeline or ops promotes on their cadence. Compatible with formal change-advisory regimes common in gov-adjacent vendors. CI stays ours; only CD is theirs.
- **Option 3 — GitOps middle ground.** A manifest repo declares the desired version; our CI updates it; a reconciler in their environment applies it; their approval gate is PR review.

Non-negotiables in any arrangement: separate staging + production in their world (our demo/dev remains in our AWS account and is region-portable by Terraform variable); **direct read access to CloudWatch logs/metrics for our services** (debugging field failures through support tickets is untenable); a named break-glass/rollback process; secrets in their environment via Parameter Store/Secrets Manager under our namespace, never visible to CI; database migrations auto-run on deploy in option 1, reviewed artifacts in option 2 — evidence-bearing schemas deserve migration review regardless.

**The split-brain advantage:** the mobile app updates over our OTA channel no matter who hosts the backend — field-experience iteration stays daily even under a heavyweight option-2 backend arrangement. API versioning discipline ensures a fresh app tolerates a backend one version behind.

**Approach posture:** arrive proposing the specific architecture with Terraform in hand ("dedicated sub-account, OIDC-federated deploys, scoped role, ECS, logs readable by us") rather than asking open-endedly for access. It signals operational maturity and typically earns more access — and adds to the "these people ship real software" pile that inflates the acquisition conversation.

---

# 10. Engineering Standards

The codebase will be inspected by the vendor's engineers during due diligence; "clean, obvious, boring" is what tips build-vs-buy toward buy. These standards apply from commit one.

**Domain language: one glossary, enforced everywhere.** Canonical nouns, never drifting: `Workflow` (the template), `Assignment` (a job), `Session` (one capture run against an assignment), `Capture` (a single piece of evidence), `Prompt` (one question), `Extraction` (AI output), `Review`, `Submission` (push to vendor). `GLOSSARY.md` is law. Database tables, TypeScript types, API routes, and UI copy use the same words — a reviewer who sees `POST /sessions/:id/captures`, a `Capture` type, and a `captures` table relaxes. The fastest way a codebase reads as slop is the same concept named `job`/`task`/`assignment`/`inspection` in four files.

**API design: predictable REST, no cleverness.** Plural nouns, nesting one level max (`/assignments`, `/assignments/:id/sessions`, `/sessions/:id/captures`, `/workflows/:id/versions`). Non-CRUD actions as explicit sub-resources (`POST /sessions/:id/submission`), never verb soup. `/v1/` from day one. One error envelope everywhere (`{ error: { code, message, details } }`), one pagination scheme (`cursor`/`limit`), one timestamp format (ISO 8601, UTC). OpenAPI generated *from* code (zod → OpenAPI), never hand-maintained — doc/reality drift is the classic due-diligence smell.

**Types as single source of truth.** `/shared` holds zod schemas for every domain object; TypeScript types derive from them; API validation, client parsing, and DB row mapping consume the same schema. One definition of `Capture` in the whole monorepo — inconsistency becomes structurally impossible rather than a matter of discipline. This is the single highest-leverage cleanliness decision.

**Layering.** Inside `/api`: routes do HTTP, services do logic, repos do data. No queries in handlers, ever. Each layer testable alone.

**Architecture Decision Records.** `/docs/adr/` one-pagers: "001: op-log sync over state sync," "002: snapshot questions into reports," "003: Capacitor over native," and so on. When due-diligence engineers ask *why*, the answers are already written, dated, and reasoned. Cheap, rare, and disproportionately impressive.

**Naming conventions, decided once.** Files kebab-case (`capture-service.ts`); types PascalCase; functions camelCase; database snake_case, with the repo layer as the only place case translation occurs. Booleans read as assertions (`isRequired`, `hasSynced`). No abbreviations in domain code (`assignment`, not `asgmt`). Event/op names past-tense and namespaced (`capture.recorded`, `session.submitted`, `extraction.completed`).

**Automated quality floor.** ESLint + Prettier strict; TypeScript `strict: true` from day one (retrofitting strict mode is misery); CI gates on lint/typecheck/tests; conventional commits (`feat:`, `fix:`) yielding changelogs for free; pre-commit hooks so nothing sloppy lands.

**Testing where it signals seriousness.** No coverage-percentage theater. Dense tests on the four things a reviewing engineer will actually inspect: sync idempotency (same op delivered twice → one record), workflow schema validation, the extraction pipeline stages, and the vendor mapping layer. Deep tests on hard parts beat shallow tests everywhere.

**Documentation.** One README per package; a root README with a system diagram passing the fifteen-minute-orientation test: a new engineer understands the system's shape before opening any code.

**Meta-principle:** wherever two reasonable options exist, pick the boring one and write down why. Due-diligence engineers are not looking for brilliance; they are estimating whether maintaining this after acquisition will hurt.

---

# 11. Business Context and Strategy

**The vendor relationship.** The vendor approached with a "can it be done" mandate — which is a build-vs-buy scoping exercise. Once feasibility is proven, their options are: acquire the solution, hire the builder, or build in-house with what they learned. Strategy: make the first two cheaper and faster than the third — generous with "yes, and here's the shape," stingy with the specifics that make it work (prompt engineering, workflow logic, completeness-checking approach). Prove feasibility with a live demo on their phones; do not hand over code.

**IP protection, immediately.** A mutual NDA before deeper technical exchange, and ideally a short memorandum: anything developed is ours until a definitive agreement says otherwise. Expect them to argue that supplying the data model and workflow requirements creates rights in the result — negotiable, but only if negotiated, never assumed. Until signed, development proceeds against an invented workflow and generic schema; the mapping layer makes the later swap clean and keeps IP hygiene intact.

**Deal-shape options.** Acqui-hire; asset acquisition; or licensing/white-label (keep the company, per-seat revenue, freedom to serve other report vendors). The third caps nothing and is the negotiating leverage for the first two: a capture layer that integrates with *multiple* report platforms is a bigger asset than a feature for one vendor. The multi-vendor abstraction is built quietly as good engineering; its existence is negotiation currency to be priced into any acquisition, not flaunted mid-courtship — acquirers may want exclusivity, and souring the deal by advertising alternatives is an unforced error.

**Positioning language that wins.** They describe their AI as grammar correction. We describe ours as: *"the AI never changes what the investigator said without their approval, and we can prove it in court."* That sentence signals deeper industry understanding than the incumbent's own — acquisition-price leverage in one line.

**Wedge.** Inspections first: high volume, simpler workflows, faster sales cycle, and the demo/pilot can center on a single high-volume inspection type. Investigations (lower volume, higher stakes, 921-aligned) follow.

**Pilot strategy.** One friendly department, likely furnished by the vendor, running real inspections. Success metrics defined up front: minutes saved per inspection, completeness rate, inspector satisfaction.

**Open business items.** Pricing model (per-seat vs. per-report vs. platform fee bundled by the vendor — this changes who the customer is and how an acquisition is valued); AI liability terms and E&O insurance; data ownership (department vs. vendor vs. us — leverage in the acquisition partly depends on the answer); competitive scan (Streamline Automations, First Due's inspection module, ESO, ImageTrend) to know the comparison set; and the founder-level question that shapes every deal term: run a company for years, or engineer a well-paid exit within a couple of years.

---

# 12. Roadmap

**Track A — business (this week):**
1. NDA / IP memo with the vendor. Nothing else waits on this; deeper technical conversations do not happen without it.
2. Four precise questions to the vendor: commercial AWS or GovCloud (which region)? What compliance authorizations do they hold, and can our service ride inside them? Does CJIS apply to any target customers? Can they furnish a friendly pilot department? Plus, casually: how is the grammar feature built (provider, account, region)?
3. Decide founder intent (company vs. exit) — it quietly shapes every deal term.

**Track B — technical:**

*Week 1 — skeleton and riskiest primitive.* Repo, CI, Terraform bootstrap (VPC, RDS, S3, ECR) in our AWS account. Capacitor shell running on a physical iPhone with camera/mic/filesystem proven. Define the two core schemas (workflow template; capture op) before any UI. Begin the audio corpus and transcription bake-off. Order test devices. Enroll Apple Developer.

*Week 2 — offline capture spine.* Workflow renderer walking prompt-by-prompt with field-sized touch targets. Local persistence to native filesystem + local op log, airplane-mode tested from day one. Completeness meter (trivial once the schema exists; a demo star).

*Week 3 — sync and pipeline.* Sync queue → idempotent API ingestion → Postgres + S3. Pipeline workers: audio → Transcribe → stored transcript → Bedrock extraction → stored field values with confidence flags; each stage a separate SQS-driven job with stored output. Hand-write one real workflow template for the wedge inspection type (swap in the vendor's official spec when it arrives).

*Week 4 — review and polish.* Review screen: extracted values, flagged uncertainties, tap-a-field-to-hear-source-audio. Conversational corrections: instruction → applied edit → diff → approve. Mocked vendor push rendering approved data in their schema shape. Deliberately not built yet: SSO (hardcode one user), multi-tenant UI, template editor, admin surfaces — the demo is the spine, not the org chart.

*Weeks 5–6 — demo and conversion.* Live demo on their phones via TestFlight, scripting one deliberately rough audio capture so they watch the AI flag uncertainty instead of guessing — the moment that sells the evidentiary philosophy. Arrive with the pilot proposal in hand: one department, one workflow, success metrics, deployment architecture sketch for their AWS. Convert enthusiasm into a committed pilot with dates before leaving the room.

*Field-test throughout:* run the flow personally in a parking lot, in wind, with gloves, in airplane mode; fix what reality breaks.

**Top schedule risks, in order:** the NDA dragging (start today); transcription quality on real dirty audio (start week 1); Apple bureaucracy (start now); government SSO integration (start early in pilot phase).

---

# 13. Open Questions

**Vendor/business:** NDA and IP memo status. Exclusivity expectations. Commercial AWS vs. GovCloud, and which authorizations. CJIS applicability. Pilot department availability. Pricing model. Data ownership. AI liability terms and insurance. Founder intent.

**Product:** Final wedge inspection type. Conversational-review interaction details (diff display on a phone; voice vs. touch editing scope; what "approve" locks). Multi-person scene handling (post-v1, but data model must not preclude). Desktop/phone sync-conflict rules. Storage-full and remote-wipe designed behaviors.

**Technical:** Transcription bake-off outcome (Transcribe vs. Whisper vs. commercial, on our corpus). Bedrock model availability in the target region. Vendor's AWS account structure (dedicated sub-account?). Compression policy numbers. Fastify vs. NestJS final call.

---

# Appendix A — Glossary

| Term | Meaning |
|---|---|
| Workflow | A versioned template of sections and prompts defining what a capture session asks |
| Assignment | A job: address, occupancy type, incident number, and metadata, usually from the report software |
| Session | One capture run against an assignment, pinned to a workflow version at start |
| Capture | A single piece of evidence: a voice note, photo, video, or selection bound to a prompt |
| Prompt | One question within a workflow |
| Op / Op log | An immutable capture operation with client UUID and device timestamp; the append-only record of a session |
| Extraction | AI-produced field values derived from transcripts, with model/prompt version recorded |
| Review | The human pass over extractions: chain-of-evidence display, conversational edits, approval |
| Submission | The push of approved data through the mapping layer to the vendor's report software |
| Snapshot | The full question text/ordering/mappings embedded into a report record at capture time |
| Override | An org-level customization layered on a platform base template |
| Sign-off | A recorded approval of a template change: who proposed, who approved, when, and the diff |

# Appendix B — Standards Reference

| Standard | Role |
|---|---|
| NFPA 921 | Guide for Fire and Explosion Investigations — methodology, terminology, coverage of a defensible investigation; deviation is effectively impeachable in court |
| NFPA 1033 | Professional qualifications for fire investigators |
| IFC / NFPA 1 | Model fire codes underlying inspections; edition adopted varies by jurisdiction, with local amendments |
| NFPA 25 | Inspection/testing/maintenance of water-based fire protection systems |
| NFPA 72 | National Fire Alarm and Signaling Code |
