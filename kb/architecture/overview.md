# Architecture Overview
<!-- Budget: 400 lines. Owner file for system shape, boundaries, key flows. -->
<!-- STATUS: PLANNED — greenfield. Everything below is the decided target architecture (cited to ADRs/PRD), not built code. Entries flip to as-built as epics land; divergence requires a superseding ADR. -->

## Shape (ADR-0014)
TS monorepo: `/app` (React/Vite in Capacitor shell — ADR-0002) · `/api` (Fastify, routes→services→repos) · `/pipeline` (SQS-driven AI stage jobs — ADR-0007) · `/shared` (zod schemas, single domain-type source) · `/infra` (Terraform) · `/docs` (planning + PDD).

## Boundaries
- Client ↔ server: append-only op-log sync, idempotent by op UUID (ADR-0003). Ops immutable after capture.
- Evidence: native filesystem client-side, S3 + Object Lock server-side; SHA-256 at capture (ADR-0004/0017).
- AI: audio → transcript → extraction as discrete stored stages; re-runs version, never overwrite (ADR-0007); Bedrock/Transcribe inside the AWS boundary (ADR-0009).
- Vendor: anti-corruption mapping layer, vendor schemas as config, importable only in the vendor-mapping module (ADR-0010).
- Tenancy: platform → vendor → org → user; org_id on every tenant-owned table from migration 0001 (ADR-0011).
- Build/deploy: GitHub Actions only; engine box never builds, signs, or touches vendor AWS (ADR-0015/0016).

## Key flows (planned, per PRD)
1. Capture (E01): assignment → session pins template version + embeds snapshot (ADR-0005/0006) → prompt-by-prompt capture, all ops + blobs local-first → completeness meter → airplane-mode completable.
2. Sync (E02): batched idempotent op ingestion → per-op receipts → receipt-confirmed local state → chunked resumable media upload.
3. AI review (E03/E04): transcription w/ confidence → extraction to template mappings → uncertainty/gap/contradiction flags (ADR-0008) → review screen with source-audio playback → conversational editing → approval.
4. Delivery (E05): mapping layer → vendor submission lifecycle → evidence package export.

## Current state
No production code. Package skeletons only (`{app,api,pipeline,shared}/src/index.ts` placeholders). First real code arrives with E01 planning + dispatch.
