# Design Contract — E01 (field-conditions UI)
<!-- Budget: 200 lines. Owner file for the E01 UI contract: tokens, component inventory, interaction rules. -->
<!-- STATUS: ACCEPTED (owner, Phase C front door, 2026-09-11) via ADR-0018. Binding wave-0 contract for E01 UI fan-out per readiness-record-E01. Values change only by superseding ADR. -->

Derived from: PRD R-005/R-010/R-011/R-021 + PDD §5.2 constraints as cited by the PRD (gloved hands, sunlight, offline states) + ADR-0002 (Capacitor), ADR-0012 (vendor theming via tokens), ADR-0013 (boring deps).

## 1. Token architecture
- Token **shape** is a zod schema: `/shared/src/design-tokens.schema.ts` (naming per R1/R5; the const is `DesignTokensSchema`). Domain rule ADR-0014 applies: this is the single type source for tokens.
- `/app` carries validated token **values** compiled to CSS custom properties at build. No hard-coded colors/sizes/durations in components — lint gate 1 bans raw hex/px literals in `/app/src` component files (allowlist: the token file itself).
- **Vendor theming (ADR-0012):** a vendor build swaps token *values*, never structure. The token file is the "tokens" named in ADR-0012's build config.
- **Themes:** `light` (sunlight-first) and `dark` (night-scene) ship together in E01. Same semantic keys; both palettes must pass the contrast floors below.

## 2. Field-conditions values (binding)
### Touch (gloved hands)
- `touch.target.min` = 48px — every interactive element. Hard floor 44pt (R-005) is never the design default.
- `touch.target.primary` = 64px — capture actions (record, shutter, next/advance).
- `touch.gap.min` = 8px between adjacent targets; selection options render as full-width tap rows.
### Legibility (direct sunlight / low light)
- Contrast floors: primary text ≥ 7:1; secondary text and status text ≥ 4.5:1; interactive non-text (borders, icons, meter fill) ≥ 3:1. Both themes.
- Type scale (px): `type.body` 18 · `type.secondary` 16 (absolute minimum on screen) · `type.prompt` 22 · `type.section` 28. Completeness meter uses tabular numerals.
- Font: system stack (no webfont dependency offline).
### Sync-state language (R-010/R-021 surface)
Five first-class semantic states, each a **color + icon + label** triple — status is never color-alone:
`state.offline` · `state.queued` · `state.uploading` · `state.safe` (server-acked, R-021) · `state.attention` (flagged / skip-documented).
Contract: every op's UI condition maps to exactly one of the five; "everything uploaded" (R-021) is `state.safe` at session scope, not a bespoke screen.
### Motion & feedback
- `motion.duration.max` = 150ms; `prefers-reduced-motion` honored (no motion-dependent meaning).
- Capture confirmation = visual + haptic pairing. Never audio-dependent (firegrounds are loud).

## 3. Interaction rules (binding)
1. No long-press-required, no swipe-only, no hover-dependent affordances — every action reachable by single tap.
2. One primary action per screen region, sized `touch.target.primary`.
3. Destructive/irreversible actions (none in capture — ops are append-only) would require typed confirmation; skip-with-reason (R-011) uses a dialog with reason field, not a gesture.

## 4. Component inventory (field-kit, in-repo)
Library decision per ADR-0018: own components styled by tokens; **Radix primitives (headless, individually imported, exact-pinned in app/package.json at wave 0)** only for dialog/focus/a11y mechanics. No styled UI kit, no CSS framework; CSS Modules + custom properties.

| Component | Purpose | Radix under it |
|---|---|---|
| PromptCard | renders one template prompt (text per `type.prompt`) | — |
| CaptureButton | primary capture action, 64px | — |
| SelectionRow | full-width option row (selection answers) | — |
| TextField | text answers | — |
| VoiceRecorder | record/stop UI over native recording (R-006) | — |
| PhotoCapture | shutter UI over native camera (R-007) | — |
| CompletenessMeter | R-010 live meter, tabular numerals | — |
| SyncBanner | session-scope sync state (five-state language) | — |
| SkipDialog | R-011 skip-with-reason | Dialog |
| ObservationFab | R-012 free-form observation entry point | Dialog |

## 5. Verification channels
- CI-verifiable: token schema validation; lint bans (raw literals, touch-target props below floors where statically checkable); contrast floors checked by a token-level test (computed pairs) — locked tests at wave 0.
- Device-validated: actual sunlight legibility, glove operation, haptics — named entries in the E01 milestone-validation checklist (readiness record).
