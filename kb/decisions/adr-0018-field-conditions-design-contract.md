# ADR-0018: Field-conditions design contract — token schema + in-repo components over UI kit
Status: Accepted   Date: 2026-09-11   Supersedes: none   Decided by: human (Phase C front door)
## Context
E01's readiness record names the design contract as the open wave-0 blocker: UI fan-out needs pinned tokens and a component approach. Field conditions (gloved hands, direct sunlight, offline states — PDD §5.2 as cited by PRD R-005/R-010/R-021) rule out desktop-default styling; ADR-0012 requires vendor rebrand by token swap; ADR-0013 penalizes heavy styled dependencies.
## Decision
Tokens are a zod-validated schema in /shared with vendor-swappable values in /app (light + dark both in E01). Components are an in-repo set ("field-kit") styled solely by tokens; Radix headless primitives — individually imported, exact-pinned — are adopted only for dialog/focus a11y mechanics. No styled UI kit (Ionic/Material rejected: design-language fight + churn), no CSS framework (Tailwind rejected: convention surface without field value). Binding values and interaction rules live in /kb/architecture/design-contract-e01.md: 48/64px touch targets (44pt hard floor per R-005), 7:1 / 4.5:1 / 3:1 contrast floors, 18px body floor, five icon+label sync states, ≤150ms motion, no long-press/swipe-only/hover affordances.
## Consequences
Look is 100% owned — vendor theming stays a pure value swap; dependency surface is a handful of headless primitives; a11y plumbing is not hand-rolled. Cost: field-kit components are built, not imported; both palettes carry contrast QA in E01.
## Compliance check
Lint gate 1: raw color/size literals banned in /app/src components (token file allowlisted). Wave-0 locked tests: token schema validates; computed contrast pairs meet floors in both themes. pr-review: new UI imports outside the Radix allowlist or below-floor touch targets are findings. Device legs (sunlight, gloves, haptics) named in the E01 milestone-validation checklist.
