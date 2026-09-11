# ADR-0001: Harness foundations — P0 interview record (calibration)
<!-- Satisfies: R8 -->
Status: Accepted
Date: 2026-09-11
Supersedes: none
Decided by: human (P0 interview, engine-session chat; owner sign-off 2026-09-11)

## Context
Phase B calibration installs the harness engine (v0.9.1, pinned) into firewalker, a greenfield TypeScript monorepo. The bootstrap's P0 interview binds the operational parameters the engine cannot infer. Product/stack decisions were already made at the front door and live in ADR-0002..ADR-0017 — this record cites them, never restates them.

## Decision
- **Product/stack (confirmations, by citation):** stack and monorepo layout per ADR-0014; client shell per ADR-0002; datastore Postgres + S3 (Object Lock on evidence) + SQS on ECS Fargate via Terraform per ADR-0013/0014/0017; AI pipeline per ADR-0007/0009.
- **Deploy adapter (intent recorded now, built at bootstrap P6):** mobile — GitHub Actions builds, TestFlight + Play internal track as staging-equivalent, store/vendor delivery as the production gate, Capgo OTA; backend — staging auto-deploy on merge, production human-gated; engine box scope ends at merge-to-main. Per ADR-0015, with credential separation per ADR-0016.
- **Spend ceilings (engine `breakers`):** $15/task, $150/epic, $25/day. The $25 day ceiling is the supervised-era value; the owner raises it deliberately when unattended runs begin.
- **Agent invocation timeouts (D-4):** engine defaults, recorded explicitly in harness/config.json — worker 45m, conflict-resolver 45m, planner 30m, test-writer 30m, integration-checker 20m, plan-reviewer 15m, pr-reviewer 15m, curator 15m, triage 15m, diagnosis 10m, signal 10m.
- **Intervals/thresholds:** dependency-refresh weekly; triage sweep daily; question-age 24h (digest escalation) / 72h (stale flag); kb-churn threshold 15% of kb lines changed within one epic → curator review.
- **Notification mechanism:** file-only for the supervised era — every question/halt exists as repo state per D-5 (question files, halt records, harness/state logs); no push channel. A push channel is chosen deliberately before unattended runs.
- **Spec framework:** BMAD planning (posture 1).
- **Test runner:** vitest (proposed at P3, owner-accepted at P0). Interim: locked ACs and the gate-3/matrix test contract run through `harness/run-tests.mjs` (file-per-test, honors HARNESS_PENDING_EXCLUDES); vitest binds as the runner inside that contract as real TS packages appear.
- **Toolchain pin:** Claude Code 2.1.236 on the engine box, recorded pending the infra-track update/pin policy.

## Consequences
Calibration config (harness/config.json) is bound from these values; width stays 0 through Phase B — nothing dispatches. Changes to any value are ADR-gated config commits, never live edits. The deploy adapter intent forecloses box-side builds/signing permanently (ADR-0015/0016).

## Compliance check
Ceilings/timeouts/width: engine breakers + config (self-attack exercises the breaker HALT). Deploy-adapter separation: secret-scan gate + box IAM review per ADR-0015/0016 compliance checks. Notification: D-5 acceptance (question file on main before any ping).
