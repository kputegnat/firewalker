# Readiness Record — Field Capture Platform / E01 (offline capture spine)
<!-- PARKED (owner scope change, 2026-09-17): E01 is full-product scope, not the current build. This record and its device checklist return at pilot planning. The current build is the prototype — see /kb/product/prototype-prd.md; its own readiness record supersedes this one for now. Design contract (ADR-0018), canonical surfaces (ADR-0019) and the ADR set remain live and binding. -->
<!-- Front-door P4 artifact (DRAFT — owner sign-off pending; execution may not start without the signed record). -->
Date: 2026-09-06   Owner sign-off: ____ (pending)

| Check | Pass | Evidence |
|---|---|---|
| Every PRD requirement has ACs | ☐ | prd.md — E01 rows R-001..R-014 carry test-grade ACs; later epics testable-as-stated, deepened per-slice at their own readiness |
| Every AC testable as stated | ☐ | DONE (Phase C): every E01 AC channel-tagged [CI]/[device] in prd.md; six ACs mechanically sharpened (R-003/005/007/010/011/013 — R-013 match = 100m config-tunable radius); device legs are DV-entries in validation-records/e01-device-checklist.md. Channel decision (owner): locked tests at mocked-plugin logic level on Linux runners; emulator smoke once per epic pre-milestone; hardware at milestone — supersedes this row's earlier "simulator/emulator on runners" wording |
| Stack ADRs cover build/test/deploy tooling | ☐ | ADR-0014 (stack), ADR-0015 (deploy adapter), ADR-0002 (client shell) |
| Deploy target + adapter approach recorded as ADR | ☐ | ADR-0015: GH Actions macOS→TestFlight, Linux→Play internal; Capgo OTA; backend staging auto/prod gated |
| Design contract pinned (UI: tokens + components) | ☐ | DONE (Phase C): ADR-0018 + kb/architecture/design-contract-e01.md — token schema in /shared, field-kit + Radix primitives, light+dark, binding floors; owner-accepted 2026-09-11 |
| Architecture/design docs name every seam class E01 needs | ☐ | prd.md conventions + ADR-0003/0004 (op log, storage), ADR-0014 (/shared schemas); seams = WorkflowTemplate, CaptureOp, local storage layout, renderer↔storage interface |

Failures return to P1–P3. Open items above are the P4 punch list; the record signs only when all boxes check.
