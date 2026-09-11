# Infrastructure
<!-- Budget: 200 lines. Owner file for deploy targets, caps, rollback. -->

## Build & deploy (intent per ADR-0015/0016 — adapter builds at bootstrap P6)
- Mobile: GitHub Actions — macOS runner → TestFlight; Linux runner → Play internal track (staging-equivalent). Store/vendor delivery = production gate. Capgo OTA for JS updates. Signing credentials ONLY in Actions secrets.
- Backend: staging auto-deploy on merge; production human-gated. Vendor-environment deploys via OIDC-assumed scoped roles from Actions — never from the engine box.
- The engine box's scope ends at merge-to-main. It never builds, signs, or holds vendor credentials.

## Engine box (operations)
- i-014bc0afe661f65fb, us-east-1. SSM-only access; zero inbound ports. Engine pinned v0.9.1; Claude Code pinned 2.1.236 (policy pending infra track).
- Secrets: instance role → Secrets Manager (two engine secrets only) → root-only tmpfs env at service start. No tokens on disk.
- Caps: AWS monthly budget $200 + CPU alarm; engine spend breakers $15/task, $150/epic, $25/day (ADR-0001). Anthropic per-key cap: pending owner console (D-8c partial).

## Product infrastructure (planned — /infra Terraform, per ADR-0013)
Allowed services: Postgres (RDS), S3 (Object Lock on evidence buckets), SQS, ECS Fargate. New services need a GovCloud/Azure-Gov-portability ADR. Nothing is provisioned yet; first Terraform lands with E02 server persistence, behind the infra-approval CI gate (human-approved applies only).

## Rollback
- Engine: pin revert (checkout previous tag + restart service).
- Product (once deployed): backend = redeploy previous image (staging), human-gated for prod; mobile = Capgo channel rollback for JS, store re-release for native. Evidence data is never rolled back (append-only, Object Lock).
