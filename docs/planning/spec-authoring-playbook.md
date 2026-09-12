> **Scope note (2026-09-06):** Retained as reference. Execution follows the harness engine's front-door formats (/kb): PRD with R-IDs, ADRs, traceability matrix, readiness records. Where this playbook and the engine differ, the engine wins.

# Spec Authoring Playbook
## How to Produce the Detailed Build Set for AI-Driven Development

**Purpose:** This document defines the method for converting the Product Design Document (PDD) into an executable specification set that AI coding agents can build from. It specifies what artifacts to produce, in what order, in what format, and to what quality bar. Follow it whenever creating or revising specs.

**The layer model:**

| Layer | Document | Question it answers | Changes |
|---|---|---|---|
| 1 | Product Design Document | Why does this exist and what are the rules? | Rarely |
| 2 | Contract specs (schemas, API, data model, screens) | What exactly is being built? | Occasionally, versioned |
| 3 | Phase files (task breakdowns) | What do I do next, and how do I know it's done? | Consumed and updated per phase |

An AI coding session is always fed: Layer 1 as standing context, the relevant Layer 2 spec(s), and exactly one Layer 3 phase file. Never ask an agent to work from Layer 1 alone — prose intent without contracts produces confident drift.

**Repository home:**

```
/docs/
  product-design.md          ← Layer 1 (exists)
  specs/                     ← Layer 2
    schemas.md
    api.md
    data-model.md
    screens/
      <screen-name>.md
    pipeline.md
    sync-protocol.md
  phases/                    ← Layer 3
    phase-1-skeleton.md
    phase-2-capture.md
    phase-3-sync-pipeline.md
    phase-4-review.md
  adr/                       ← decision records (ongoing)
  GLOSSARY.md                ← canonical vocabulary (law)
```

---

# Part 1 — Rules That Apply to Every Spec

**R1. Glossary vocabulary only.** Every spec uses the canonical nouns (Workflow, Assignment, Session, Capture, Prompt, Extraction, Review, Submission, Op, Snapshot, Override, Sign-off) exactly as defined in GLOSSARY.md. If a spec needs a new concept, add it to the glossary *first*, then use it. A spec that invents a synonym is defective.

**R2. Contracts are code, not prose.** Wherever a shape can be expressed as a zod schema, a SQL DDL block, or a typed route signature, express it that way — inside the spec document, in fenced code blocks. Prose explains intent; code defines truth. The agent copies the code blocks into `/shared` verbatim, so they must be complete and valid, not illustrative fragments.

**R3. Every behavior gets an acceptance criterion.** A spec statement without a testable "done" condition is a wish, not a spec. Write criteria in Given/When/Then form or as concrete input→output assertions. If you cannot state how to verify it, the spec item is not finished.

**R4. Specify all states, not the happy path.** Every screen and every endpoint spec must cover: empty, loading, offline, partial-failure, error, and permission-denied states. Field conditions make the unhappy paths the common paths. A screen spec missing its offline state is defective.

**R5. Cross-reference by ID.** Give every spec item a stable ID (`SCH-3`, `API-12`, `SCR-CAPTURE-4`, `T-2.7`). Phase tasks reference the spec IDs they implement; tests reference the IDs they verify. This makes coverage auditable ("which task implements API-12? which test verifies it?") and lets an agent trace any line of code back to its requirement.

**R6. Decisions live in ADRs, not in chat history.** Any time spec authoring forces a choice between reasonable options, write a one-page ADR (numbered, dated, with the options considered and the reason chosen). The spec then references the ADR. This is what keeps the spec set coherent across many AI sessions that share no memory.

**R7. Principles resolve ambiguity.** When a spec is silent, the agent applies the PDD principles in this order: evidence integrity > flag-don't-guess > offline-first > consequences-not-mechanisms > config-not-code > boring-and-consistent. State this hierarchy at the top of every phase file.

**R8. One writer, then adversarial review.** After drafting any spec, run a review pass with a different prompt/session whose only job is to attack it: find undefined states, untestable statements, glossary violations, and contradictions with the PDD. Fix, then freeze. Specs are versioned; a frozen spec changes only with a changelog entry.

---

# Part 2 — The Layer 2 Artifacts: What to Produce and How

Produce them in this order — each unblocks the next.

## 2.1 `specs/schemas.md` — Domain Schemas (produce first)

The two anchor schemas plus their satellites, as real zod code:

1. **WorkflowTemplate**: sections → prompts → answer types (voice | photo | video | selection | text) → required flags → conditional logic (show-if rules) → data-model mappings → lockability metadata (org-may-disable, org-may-reword, locked, required_by) → version metadata.
2. **CaptureOp**: op UUID, session ref, prompt ref, device timestamp, op type (`capture.recorded`, `capture.amended`, `session.started`, `session.submitted`, ...), payload ref (blob pointer + checksum), and sync-status fields.
3. Satellites: Assignment, Session (including pinned template version + embedded question Snapshot), Extraction (with model/prompt version fields and confidence), ReviewAction, Submission.

**Required companion: one complete worked example** — a full mock inspection template (20–30 prompts, at least one conditional branch, at least one locked question, realistic fire-service wording) as a JSON document that validates against the schema. This example is load-bearing: agents, tests, and the demo all use it. Write it before the vendor's official spec arrives; swap later.

**Quality bar:** the schemas compile; the example validates; every field has a one-line comment stating its purpose; evidentiary fields (checksums, device timestamps, snapshots) are present per PDD §7.

## 2.2 `specs/data-model.md` — Database Schema

For every table: SQL DDL, column comments, indexes with the query that justifies each, and tenancy scoping (org_id on every tenant-owned table, from day one). Include: the append-only constraint approach for ops, write-once expectations for evidence pointers, and the migration numbering convention. State explicitly which tables are append-only and which are mutable, and why.

**Quality bar:** DDL runs clean on Postgres; every FK relationship diagrammed (ASCII or mermaid); each table maps to a glossary noun.

## 2.3 `specs/api.md` — API Contract

Route-by-route: method, path, auth requirement, request schema (zod ref), response schema, every error code with its trigger condition, idempotency behavior, and pagination where applicable. Follow the PDD §10 conventions (plural nouns, one-level nesting, sub-resource actions, `/v1/`, single error envelope).

Special care on the two hard endpoints:
- **Op ingestion** (`POST /v1/sessions/:id/ops`): batch semantics, per-op receipt statuses, idempotency by op UUID, behavior on partial batch failure, and out-of-order tolerance.
- **Submission** (`POST /v1/sessions/:id/submission`): state preconditions (all required approved or skip-documented), what locks, delivery-status lifecycle.

**Quality bar:** an agent can generate the Fastify/NestJS routes and the client SDK from this document alone, without asking questions.

## 2.4 `specs/sync-protocol.md` — Offline/Sync Behavior

The client-side half the API spec doesn't cover: local persistence layout (native filesystem paths, local op log structure), queue drain rules, retry/backoff policy, receipt confirmation and the "safely uploaded" state machine, resumable upload chunking for media, conflict rules (phone vs. desktop edits), clock handling (device time + server receipt time), and behavior on storage-full, token-expiry-while-offline, and mid-capture app kill.

Write the sync lifecycle as an explicit state machine: states, transitions, and what the user sees in each. This is the spec where R4 (all states) matters most.

## 2.5 `specs/pipeline.md` — AI Pipeline Stages

For each stage (transcribe → extract → map): input artifact, output artifact, storage location, the model/prompt version recording requirement, confidence/uncertainty flagging rules (thresholds and what they trigger in review), retry and poison-message handling, and replayability requirements (re-running extraction on an old transcript must be possible and must produce a *new* versioned Extraction, never overwrite).

Include the extraction prompt itself as a versioned artifact in the spec, with its output JSON contract.

## 2.6 `specs/screens/` — One File Per Screen

Screens for the demo slice: assignment-list, capture-flow, completeness-meter (may fold into capture-flow), review, conversational-edit. Each file contains:

- **Purpose** (one sentence) and the glossary nouns it operates on
- **Layout description** (ASCII wireframe acceptable; field-conditions constraints stated: touch target minimums, contrast, one-handed reach)
- **State machine**: every state (empty, loading, offline, syncing, error, done) and every transition, with what is displayed and enabled in each
- **Every interaction**: tap/hold/voice command → resulting state change → resulting op(s) written
- **Copy**: the actual words on buttons and messages, in plain field-user language (consequences, not mechanisms)
- **Acceptance criteria** per R3

AI agents build UI dramatically better from state-machine descriptions than from prose vibes; the state table is the heart of each screen spec.

---

# Part 3 — The Layer 3 Artifacts: Phase Files

## 3.1 Phase File Anatomy

Each phase file contains, in order:

1. **Context block**: which specs this phase implements (by ID range), what exists at phase start, what must exist at phase end.
2. **The principle hierarchy** (R7) restated.
3. **Ordered task list**, where every task follows the task template below.
4. **Phase exit criteria**: the demo-able behavior that proves the phase complete (e.g., Phase 2 exit: "in airplane mode, complete the worked-example inspection end to end; kill and relaunch the app mid-session; nothing is lost; completeness meter accurate throughout").

## 3.2 The Task Template

Every task is written to be executable by an agent in one focused session, with no unstated dependencies:

```
### T-2.4 Implement local op log persistence
Implements: SCH-2 (CaptureOp), SYNC-3, SYNC-7
Depends on: T-2.1, T-2.2
Scope: /app/src/storage/**

Do:
- Write CaptureOps to <path convention> via the Capacitor filesystem plugin
- Append-only file-per-session; ops serialized per SCH-2
- Blob payloads stored separately at <convention>, referenced by checksum

Do NOT:
- Use IndexedDB or localStorage for any evidence data (ADR-004)
- Implement sync/drain (that is T-3.x)

Acceptance:
- Given 50 ops written then app force-killed, When relaunched,
  Then all 50 ops readable and valid against SCH-2
- Given a blob write interrupted mid-way, When relaunched,
  Then the op is absent or marked incomplete — never a valid op
  pointing at a corrupt blob
- Tests included covering both criteria
```

Rules for tasks:
- **Sized for one session** (roughly: one service, one screen state-machine, one endpoint group). If the Do list exceeds ~6 items, split it.
- **Do NOT section is mandatory** — it fences the agent from wandering into adjacent tasks and from violating ADRs.
- **Scope paths declared** — the agent touches only listed paths; anything else is a spec change, not an implementation detail.
- **Tests are part of the task**, written from the acceptance criteria — ideally written first.
- **Dependency-ordered**, so the phase can be executed top to bottom.

## 3.3 The Phase Map (Initial)

- **Phase 1 — Skeleton:** repo, CI, lint/strict TS, Terraform bootstrap, Capacitor shell proving camera/mic/filesystem on device, `/shared` package with schemas from specs/schemas.md, GLOSSARY.md. Exit: hello-world capture on a physical iPhone; CI green on a trivial PR.
- **Phase 2 — Offline capture spine:** workflow renderer from the worked example, local op log, completeness meter, skip-with-reason. Exit: full inspection in airplane mode surviving app kill.
- **Phase 3 — Sync + pipeline:** idempotent ingestion, background drain, receipt states; transcribe→extract→map workers with stored stages and confidence flags. Exit: field capture on device appears as flagged, extracted values in the database with full stage artifacts.
- **Phase 4 — Review + demo polish:** review screen with tap-to-hear-source-audio, conversational edit with diff/approve, mocked vendor push, TestFlight distribution. Exit: the scripted vendor demo runs end to end on their phones, including the deliberate rough-audio uncertainty moment.

Each phase file is written **just-in-time** (at the end of the prior phase), because reality will amend the plan — but the phase *map* stays stable.

---

# Part 4 — Operating the Loop with AI Agents

**Session recipe.** Each coding session receives: (1) product-design.md, (2) GLOSSARY.md, (3) the referenced spec files for the task, (4) the single task block. Nothing else. Oversupplying context invites the agent to "improve" things outside scope.

**Definition of done is mechanical:** acceptance criteria pass, tests exist and pass, lint/typecheck clean, only scoped paths touched, glossary vocabulary throughout, conventional commit message referencing the task ID (`feat(capture): local op log persistence [T-2.4]`).

**Review pass per task:** a separate review session (or human review) checks the diff against the task's Do NOT list and the ADRs before merge. The reviewer prompt is standing: "Find violations of the task scope, the ADRs, and the PDD principles. Find untested acceptance criteria."

**Drift control:** when an agent's work reveals a spec gap or contradiction, the fix is a spec edit + changelog (and an ADR if it was a decision), *then* re-execution — never a silent in-code workaround. The specs must remain the truth an acquirer's engineers can read.

**Artifact hygiene:** worked-example template, extraction prompts, and any seed data live in the repo and are referenced by path in specs — no critical artifact exists only inside a chat transcript.

---

# Part 5 — Authoring Order and First Actions

1. Write GLOSSARY.md (lift from PDD Appendix A, extend as needed)
2. Write specs/schemas.md + the worked-example inspection template
3. Write specs/data-model.md
4. Write specs/api.md and specs/sync-protocol.md (in parallel — they share the op contract)
5. Write specs/pipeline.md
6. Write specs/screens/ for the demo-slice screens
7. Write phases/phase-1-skeleton.md
8. Begin Phase 1 execution while authoring Phase 2

Steps 1–2 unblock everything and should be produced first; each is a focused session using this playbook as its instruction set.
