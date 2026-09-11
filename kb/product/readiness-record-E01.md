# Readiness Record — Field Capture Platform / E01 (offline capture spine)
<!-- Front-door P4 artifact (DRAFT — owner sign-off pending; execution may not start without the signed record). -->
Date: 2026-09-06   Owner sign-off: ____ (pending)

| Check | Pass | Evidence |
|---|---|---|
| Every PRD requirement has ACs | ☐ | prd.md — E01 rows R-001..R-014 carry test-grade ACs; later epics testable-as-stated, deepened per-slice at their own readiness |
| Every AC testable as stated | ☐ | E01 ACs reviewed; R-013 needs a mock-location fixture; NOTE for planner: device-dependent ACs (R-005–R-009, R-013–R-014) split into CI-verifiable parts (simulator/emulator on runners) and device-validated parts checked at milestone validation — the plan must name the channel per AC |
| Stack ADRs cover build/test/deploy tooling | ☐ | ADR-0014 (stack), ADR-0015 (deploy adapter), ADR-0002 (client shell) |
| Deploy target + adapter approach recorded as ADR | ☐ | ADR-0015: GH Actions macOS→TestFlight, Linux→Play internal; Capgo OTA; backend staging auto/prod gated |
| Design contract pinned (UI: tokens + components) | ☐ | OPEN — field-conditions token set + component library to be pinned as E01 wave-zero contract before UI fan-out (planner directive; PDD §5.2 constraints are the input) |
| Architecture/design docs name every seam class E01 needs | ☐ | prd.md conventions + ADR-0003/0004 (op log, storage), ADR-0014 (/shared schemas); seams = WorkflowTemplate, CaptureOp, local storage layout, renderer↔storage interface |

Failures return to P1–P3. Open items above are the P4 punch list; the record signs only when all boxes check.
