# Prototype Flow — screens and states
<!-- Budget: 250 lines. Owner file for the prototype's screen-by-screen flow: states, transitions, ops written, copy. -->
<!-- STATUS: DRAFT (owner approval pending). Implements kb/product/prototype-prd.md R-100..R-123 under the ADR-0018 design contract. -->
<!-- Written as state machines, not prose: every screen lists its states, what shows in each, and what transitions out. Agents build UI far better from this than from description. -->

## The loop in one line
Case start → **[ prompt → prompt → … → section end → extract → review → confirm ]** per section → export.
Blazestack's six steps map onto it: prompt (SCR-2) → capture (SCR-2) → extract (SCR-4) → review (SCR-5) → confirm/correct (SCR-5/6) → save and advance (SCR-7).

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
| `starting` | Spinner on button | success → SCR-2 first prompt |

Copy: title "New case"; field label "Incident address"; button "Start case".
Note: coordinates are logged silently at start (R-013 disposition — log, never verify).

---

## SCR-2 — Prompt (the screen the investigator lives on)
**Purpose:** ask one field, capture one answer. **Ops:** `capture.{voice-note|photo|selection|text}.recorded`, `capture.field.marked-unknown`.

**Layout top to bottom:** prompt text (`type.prompt`, 22px) · answer control (by type) · "Unknown / unavailable" secondary action · primary advance.

### Answer-type variants
| Type | Control | Advance behaviour |
|---|---|---|
| `selection` | Full-width tap rows, one per option | **auto-advance on tap** |
| `voice` | Big record button (64px), elapsed timer, live level meter | manual "Next" after stop |
| `photo` | Shutter button → camera → thumbnail strip (max 10) | manual "Next"; "Add another" stays available |
| `text` | Field + keyboard, mic icon for dictation | manual "Next" |

### States
| State | Shows | Exit |
|---|---|---|
| `unanswered` | Control idle; "Next" disabled if required | answer → `answered` · unknown → `resolved` |
| `recording` | Timer counting, level meter, button becomes Stop. **Only exit is Stop** — no navigation while recording | stop → `answered` |
| `answered` | Captured evidence shown (waveform / thumbnail / chosen option); "Next" enabled; answer replaceable | Next → next prompt, or section end → SCR-4 |
| `resolved` | "Marked unknown" chip with undo | Next → advance |

Rules: no long-press, no swipe-only, no hover (ADR-0018). Recording survives pocketing only in the native build — browser prototype stops on tab background, and that limit is recorded in ADR-0020, not hidden from the user.

Copy: secondary action "Unknown or unavailable" (their language, R-111); primary "Next".

---

## SCR-3 — Repeating-group boundary
**Purpose:** decide whether another instance follows (Electrical Subpanel 1..n, R-105). **Ops:** `capture.group-instance.added`.

| State | Shows | Exit |
|---|---|---|
| `prompt` | "Electrical Subpanel 1 captured." Primary "Add another subpanel" · secondary "No more subpanels" | add → SCR-2 at the instance's first field, header now "Subpanel 2" · done → SCR-4 |

Each instance carries the full field set independently; instance index rides on every op.

---

## SCR-4 — Extracting
**Purpose:** the honest waiting state while transcription + extraction run (R-114/R-115). **Ops:** none.

| State | Shows | Exit |
|---|---|---|
| `working` | Section name, "Reading your answers…", per-item ticks as each voice note transcribes | all done → SCR-5 |
| `slow` (>15s) | Adds "Still working — you can keep capturing" + link to next section | user leaves → capture continues, review queued |
| `failed` | "Couldn't process 2 of 6 answers" + Retry; **captured evidence is never lost** | retry → `working` · skip → SCR-5 with those fields unpopulated and flagged |

The `slow` path exists because blocking an investigator on a model call is the failure mode their loop invites.

---

## SCR-5 — Section review
**Purpose:** show what the AI proposes, with its evidence (R-120). **Ops:** `review.value.confirmed`, `review.value.rejected`.

Row per field: field label · proposed value · flag chip if any · ▸ play source audio.

| Flag | Meaning | Rendering |
|---|---|---|
| `uncertain` | below confidence threshold (R-117) | amber chip "Check this" |
| `suggestion` | near-miss on option list (R-118) | "Did you mean *Service lateral from a pad-mounted transformer*?" with accept/keep |
| `proposed-option` | no acceptable match (R-119) | "New option — will be sent for review" |
| `gap` | required, no supporting evidence | "Nothing captured for this" + jump back to that prompt |

| State | Shows | Exit |
|---|---|---|
| `reviewing` | All rows; "Confirm section" enabled only when no `gap` remains | tap row → SCR-6 · confirm → SCR-7 |
| `confirming` | Spinner | → SCR-7 |

**Flagged fields are excluded from any confirm-all action** (ADR-0008). Tapping a value plays the exact audio segment behind it — this is the chain of evidence made visible.

---

## SCR-6 — Correction
**Purpose:** change a value, by touch or by voice, with the change shown before it applies (R-121). **Ops:** `review.correction.proposed`, `review.correction.applied|rejected`.

| State | Shows | Exit |
|---|---|---|
| `editing` | The field's native control (option list / text / etc.) + mic for spoken instruction | touch edit → `proposed` · speak → `interpreting` |
| `interpreting` | "Understanding…" | → `proposed` · unparseable → `editing` with "Didn't catch that" |
| `proposed` | **Before → after, both visible.** "Apply" / "Discard" | apply → SCR-5 updated · discard → SCR-5 unchanged, rejection recorded |

Nothing is ever applied unshown. Corrections append new ops; the prior value stays in the log.

---

## SCR-7 — Section complete
**Purpose:** close the section and move on (R-122). **Ops:** `session.section.confirmed`.

| State | Shows | Exit |
|---|---|---|
| `done` | "Electrical Supply confirmed · 9 of 9" · upload-state dot · primary "Next section: Electrical Subpanels" · secondary "Back to case" | next → SCR-2 · back → case overview |
| `last-section` | Primary becomes "Finish case" | → SCR-8 |

Confirmed values are immutable; later changes are new ops (see open question in the PRD).

---

## SCR-8 — Case output
**Purpose:** prove the prototype's endpoint — fields, delivered (R-123). **Ops:** `session.case.exported`.

| State | Shows | Exit |
|---|---|---|
| `summary` | Per-section confirmed counts, flags outstanding, proposed options listed | "View JSON" → `json` · "Copy JSON" → clipboard |
| `json` | The Blazestack-shaped payload, monospace, scrollable, copyable | back → `summary` |

This screen is the demo moment: their field names, their option values, their repeating-group arrays — ready for their system to consume.

---

## Cross-cutting states
| Condition | Behaviour |
|---|---|
| Upload queued | Chrome dot shows `queued`; capture never blocks |
| Extraction unavailable | SCR-4 `failed` path; capture continues; review deferred |
| Reload mid-section | Session resumes at the last unanswered prompt; confirmed answers intact (R-109) |
| Required field unanswered | "Confirm section" stays disabled; the `gap` row deep-links back to the prompt |

## Open flow questions
1. Case overview screen (list of sections with completion dots, like theirs) — assumed reachable from SCR-7's "Back to case" but not yet specified. Needed for jumping between sections out of order; omit if the prototype is strictly linear.
2. SCR-4 blocks advancement per Blazestack's loop; the `slow` escape hatch deviates from their doc deliberately.
3. Photo cap of 10 per field mirrors their app — confirm it should apply here.
