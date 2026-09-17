# Prototype Flow — screens and states
<!-- Budget: 250 lines. Owner file for the prototype's screen-by-screen flow: states, transitions, ops written, copy. -->
<!-- STATUS: DRAFT (owner approval pending). Implements kb/product/prototype-prd.md R-100..R-133 under the ADR-0018 design contract. -->
<!-- Written as state machines, not prose: every screen lists its states, what shows in each, and what transitions out. Agents build UI far better from this than from description. -->

## The loop in one line
Case start → **shoot and talk, shoot and talk, shoot and talk** (derivation running invisibly the whole time) → review the derived fields whenever it suits — in the vehicle, at the station, next week → correct → export.

Two rules govern everything below:
1. **The investigator never fills a form during capture.** They photograph and narrate; fields appear afterwards, already proposed.
2. **The app never makes them wait.** Derivation is background work; capture is always available, always responsive.

Blazestack's six steps still map on, but the sequence is decoupled rather than serial: prompt and capture (SCR-2) happen on scene; extract (background), review and correct (SCR-5/6) happen whenever; save and advance (SCR-7) is a marker, not a gate.

## Navigation model
**Non-linear by default.** A case overview (SCR-0) lists sections with fields-resolved counts; any section and any prompt is reachable from it at any time. The per-prompt "Next" is a convenience path through a section, never the only one. Recording is reachable from every screen (R-128), so a thing remembered in section 3 can be narrated immediately and filed against section 1.

## SCR-0 — Case overview
**Purpose:** the hub. See where the case stands, go anywhere, capture anything.

| State | Shows | Exit |
|---|---|---|
| `overview` | Section rows with fields-resolved counts ("Electrical Supply · 6 of 9") · unassigned-capture tray if any · floating record button · "Export" always available | section → SCR-2 · unassigned item → assignment sheet · record → capture, then assign · export → SCR-8 |

The unassigned tray is what makes "capture now, file it later" safe: nothing recorded is ever lost for want of a home.

## Global chrome (every screen except SCR-1)
- **Top bar:** back chevron · section name ("Electrical Supply") · upload-state dot (CS-12 sync tokens: queued / uploading / safe — icon + label, never colour alone).
- **Progress strip:** "4 of 9" for the active section. Tabular numerals.
- **No bottom nav.** One primary action per screen, `touch.target.primary` (64px).

---

## SCR-1 — Case start
**Purpose:** identify the case before any capture. **Ops:** `session.case.started`.

| State | Shows | Exit |
|---|---|---|
| `empty` | Address field (dictation enabled), case-type selector, "Start case" disabled | → `ready` when address non-empty |
| `ready` | Same, "Start case" enabled | tap → `starting` |
| `starting` | Spinner on button | success → SCR-0 case overview |

Copy: title "New case"; field label "Incident address"; button "Start case".
Note: coordinates are logged silently at start (R-013 disposition — log, never verify).

---

## SCR-2 — Capture prompt (the screen the investigator lives on)
**Purpose:** gather the photographs and narration that the section's fields will be derived from. **This screen never shows a form.** No dropdowns, no field labels, no option lists — those belong to review (SCR-5), after the AI has had its attempt. **Ops:** `capture.photo.recorded`, `capture.voice-note.recorded`, `capture.prompt.marked-unavailable`.

**Layout top to bottom:** capture prompt (`type.prompt`, 22px — *"Photograph the electrical service where it enters the structure"*) · one line of why it matters · **camera and microphone side by side, 64px each, equal weight** · captured-evidence strip (thumbnails and waveforms) · "Not available here" secondary · "Next" primary.

The two capture actions are the screen. Everything else is subordinate to them.

### States
| State | Shows | Exit |
|---|---|---|
| `empty` | Both capture actions prominent; evidence strip absent; "Next" disabled while the prompt is required | photo → `captured` · record → `recording` · unavailable → `resolved` |
| `recording` | Elapsed timer, live level meter, button becomes Stop. **Only exit is Stop** — no navigation mid-recording | stop → `captured` |
| `captured` | Evidence strip with every photo and recording so far; both capture actions remain available for more; "Next" enabled | more → stays here · Next → next prompt; at section end → SCR-0 or straight into the next section. Derivation is already running in the background |
| `resolved` | "Marked unavailable" chip with undo | Next → advance |

**Multiple captures per prompt are normal, not exceptional** — a panel might warrant twenty-five photographs and forty seconds of narration, and one capture may populate several fields (R-100's many-to-many). **Neither modality is required** (R-126): dark or wet means no photographs, sirens mean no narration, and both absences are fine.

### SCR-2a — Evidence tray (from `captured`, tap the strip)
| State | Shows | Exit |
|---|---|---|
| `browsing` | Photographs ranked by quality score, top-scoring preselected, checkboxes for derivation selection (R-129); import button for camera-sourced files (R-127); **record button live while browsing** (R-130) | select → updates derivation set · record → `narrating` · back → SCR-2 |
| `narrating` | Recording while the investigator flips through photographs; each photo view span is marked against the audio (R-130) | stop → `browsing`, correlation stored |

Low-scoring captures raise a dismissible retake nudge at capture time. **No photograph is ever excluded from selection** — the score orders, the investigator decides.

Rules: no long-press, no swipe-only, no hover (ADR-0018). Browser recording stops when the tab backgrounds — a limit recorded in ADR-0020 and surfaced to the user, not hidden.

Copy: secondary "Not available here" (R-110); primary "Next".

---

## SCR-3 — Repeating-group boundary
**Purpose:** decide whether another instance follows (Electrical Subpanel 1..n, R-105). **Ops:** `capture.group-instance.added`.

| State | Shows | Exit |
|---|---|---|
| `prompt` | "Electrical Subpanel 1 captured." Primary "Add another subpanel" · secondary "No more subpanels" | add → SCR-2 at the new instance, header now "Subpanel 2" · done → SCR-0 or next section |

Each instance carries the full field set independently; instance index rides on every op.

---

## SCR-4 — Derivation (there is no screen; this is the point)
**Deleted as a blocking state.** Derivation runs in the background from the moment each evidence item lands (R-131). The investigator never waits — not fifteen seconds, not one. They may have minutes inside a structure, and none of them belong to us.

Derivation surfaces only as **chrome**, never as a gate:

| Indicator state | Shows | Behaviour |
|---|---|---|
| `idle` | nothing | — |
| `processing` | small count in the top bar ("3 processing"), no motion that competes with capture | capture fully responsive; tapping it opens SCR-5 for whatever is already derived |
| `ready` | badge on the section / case overview: "6 fields derived" | purely informational; review is a destination, never an interruption |
| `failed` | badge "2 items couldn't be read" with retry | **captured evidence is never lost**; those fields simply remain underived |

Results land quietly and accumulate. Review (SCR-5) is a place the investigator chooses to go — at the vehicle, at the station, or a week later — not a step in the capture path.

---

## SCR-5 — Section review
**Purpose:** show what the AI proposes, with its evidence (R-122). **Ops:** `review.value.confirmed`, `review.value.rejected`.

**This is the first screen where fields appear at all.** Row per target field: field label · derived value · provenance chip (📷 photo / 🎙 audio / ✋ manual) · flag chip if any. Tapping the provenance chip opens the source photograph or plays the source audio segment (R-116).

A field the AI could not derive shows as an empty row with "Add manually" — the fallback path, visibly the exception rather than the norm.

| Flag | Meaning | Rendering |
|---|---|---|
| `uncertain` | below confidence threshold (R-117) | amber chip "Check this" |
| `suggestion` | near-miss on option list (R-118) | "Did you mean *Service lateral from a pad-mounted transformer*?" with accept/keep |
| `proposed-option` | no acceptable match (R-119) | "New option — will be sent for review" |
| `gap` | required, no supporting evidence | "Nothing captured for this" + jump back to that prompt |

| State | Shows | Exit |
|---|---|---|
| `reviewing` | All rows; "Mark reviewed" always available — outstanding `gap` rows warn, never block (R-124) | tap row → SCR-6 · mark reviewed → SCR-7 |

**Flagged fields are excluded from any accept-all-values action** (ADR-0008); the reviewed marker itself is never gated. Tapping a value plays the exact audio segment behind it — this is the chain of evidence made visible.

---

## SCR-6 — Correction
**Purpose:** change a value, by touch or by voice, with the change shown before it applies (R-123). **Ops:** `review.correction.proposed`, `review.correction.applied|rejected`.

| State | Shows | Exit |
|---|---|---|
| `editing` | The field's native control (option list / text / etc.) + mic for spoken instruction | touch edit → `proposed` · speak → `interpreting` |
| `interpreting` | "Understanding…" | → `proposed` · unparseable → `editing` with "Didn't catch that" |
| `proposed` | **Before → after, both visible.** "Apply" / "Discard" | apply → SCR-5 updated · discard → SCR-5 unchanged, rejection recorded |

Nothing is ever applied unshown. Corrections append new ops; the prior value stays in the log.

---

## SCR-7 — Section reviewed
**Purpose:** mark a section as looked-at and offer somewhere to go next (R-124). **Ops:** `session.section.reviewed`.

| State | Shows | Exit |
|---|---|---|
| `done` | "Electrical Supply · 9 of 9 resolved" · reviewed toggle · upload-state dot · primary "Next section: Electrical Subpanels" · secondary "Back to case" | next → SCR-2 · back → SCR-0 |
| `last-section` | Primary becomes "Export case" | → SCR-8 |

**Nothing is locked.** A reviewed section reopens and edits freely; the marker is the investigator's own bookkeeping. The finality gate — if there is one — belongs at sync or export into Blazestack's system, and is deliberately out of prototype scope.

---

## SCR-8 — Case output
**Purpose:** prove the prototype's endpoint — fields, delivered (R-125). **Ops:** `session.case.exported`.

| State | Shows | Exit |
|---|---|---|
| `summary` | Per-section reviewed/resolved counts, flags outstanding, unreviewed sections warned, proposed options listed | "View JSON" → `json` · "Copy JSON" → clipboard |
| `json` | The Blazestack-shaped payload, monospace, scrollable, copyable | back → `summary` |

This screen is the demo moment: their field names, their option values, their repeating-group arrays — ready for their system to consume.

---

## Cross-cutting states
| Condition | Behaviour |
|---|---|
| Upload queued | Chrome dot shows `queued`; capture never blocks |
| Extraction unavailable | SCR-4 `failed` path; capture continues; review deferred |
| Reload mid-session | Session resumes where the investigator left off; all captures intact (R-108) |
| Required field unresolved | `gap` row warns and deep-links back to its prompt; marking reviewed is never blocked (R-124) |

## Open flow questions
1. RESOLVED (owner, 2026-09-17): the prototype is explicitly non-linear — SCR-0 case overview is required, not optional.
2. RESOLVED (owner, 2026-09-17): derivation never blocks capture at all. SCR-4 deleted as a screen; background only. Deliberate deviation from their blocking loop.
3. Photo cap of 10 per field mirrors their app — confirm it should apply here.
