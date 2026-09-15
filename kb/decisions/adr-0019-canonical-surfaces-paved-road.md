# ADR-0019: Canonical surfaces and the paved-road mandate
Status: Accepted   Date: 2026-09-15   Supersedes: none   Decided by: human (owner mandate, Phase C; approved 2026-09-15)
## Context
Two failure modes are refused by owner mandate: (1) **duplication/overlap** — redundant calls, overlapping queries, re-implemented checks, near-identical variants each maintained separately; (2) **opt-in infrastructure** — the correct surface exists but nothing forces its use. Both scale badly under this project's delivery model: N workers dispatch in parallel into isolated worktrees and cannot see each other's work, so absent mechanical denial each independently re-implements the same concern a different way. Review cannot catch this reliably; lint can. [ADR-0001; PDD §10]
## Decision
Every cross-cutting concern has exactly **one** canonical surface, registered in `/kb/conventions/canonical-surfaces.md`. New code routes through it. The underlying raw primitive is **denied by lint at gate 1**, not merely discouraged. Deviation requires a recorded, owner-approved exception.

**Exception process.**
1. Author proposes a registry row: exception ID (`CS-EX-###`), the surface deviated from, scope (explicit paths), justification, and expiry (or `permanent`).
2. **Owner approves by merging the registry change.** The row must exist on `main` before the pragma is valid — workers never self-grant.
3. Code cites it on the line above the deviation: `// paved-road-exception: CS-EX-007 — <one-line reason>`.
4. Gate 1 fails on: a lint suppression of a restricted rule without a pragma; a pragma citing an ID absent from the registry; a pragma outside its exception's declared scope paths; an expired exception.

**Registry governance.** `/kb/conventions/canonical-surfaces.md` changes — new surfaces, altered denials, and every exception row — land only with owner approval; the owner's merge **is** the approval, per the process above. No agent grants itself a surface or an exception. Expired exception rows are swept by the curator janitor pass (engine-side enhancement filed); until that ships, expiry is enforced at gate 1 by `paved-road-check.mjs`.

**Self-attack coverage.** The paved-road machinery is itself fixture-tested like every other gate — planted denied-primitive, uncited-pragma, and uncovered-suppression defects must each FIRE at gate 1 and revert clean. Fixtures are specified in the registry appendix and bind with the gate, not after it.
## Consequences
One way to do each thing; duplication becomes a mechanical failure rather than a reviewer opinion. Adding a *new* cross-cutting concern now carries a prerequisite — its registry entry and lint rule land before its first consumer. Genuinely justified deviations carry real process, deliberately: adding a surface is cheap, removing a lint denial is not. The registry is durable truth and is curator-verified against the codemap.
## Compliance check
Gate 1 binds `no-restricted-globals` / `no-restricted-imports` / `no-restricted-syntax` per the registry appendix, plus `harness/scripts/paved-road-check.mjs` for pragma validation and non-ESLint surfaces (CSS token literals). pr-reviewer mandate extension: flag re-implementation of a registered surface **even when lint is silent** (semantic duplication is the residual class lint cannot see). Curator kb-verification: a cross-cutting surface present in the codemap but absent from the registry is a finding. Self-attack fixtures SA-PR-1..3 (registry appendix) run with the gate suite and must fire then revert clean. Registry governance is process-level today — owner merge is the approval; binding it mechanically (CODEOWNERS on the registry path + require-code-owner-review in the branch ruleset) is a recorded follow-up, not yet in place.
