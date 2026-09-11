# Data Model
<!-- Budget: 400 lines. Owner file for entities, relations, date/ID semantics. -->
<!-- STATUS: PLANNED — greenfield. Core entities as decided in PRD/ADRs; concrete zod schemas land in /shared with E01 (R-001/R-002) and this doc flips to as-built per entity. -->

## Core entities (planned)
- **WorkflowTemplate** (R-001): sections → prompts → answer types (voice|photo|selection|text; `video` reserved) → required flags → conditional show-if → data-model mappings → lockability metadata (org-may-disable | org-may-reword | locked, required_by). Published versions immutable (R-060).
- **CaptureSession** (R-004): pins template version at start + embeds full question snapshot (ADR-0005/0006); assignment ref; GPS verification record (R-013).
- **CaptureOp** (R-002): op UUID (client-generated), session ref, prompt ref, op type (past-tense namespaced — naming.md R6), device timestamp, payload ref + SHA-256. Append-only, immutable (ADR-0003).
- **EvidenceBlob**: native-filesystem client-side / S3 server-side; SHA-256 at capture; originals never mutated (ADR-0004/0017).
- **Extraction** (R-033): versioned AI-stage output; model ID + prompt version recorded (R-032); never overwritten.
- **Tenancy** (R-080): platform → vendor → org → user; org_id on every tenant-owned table from first migration (ADR-0011).

## ID & date semantics (planned)
- Op IDs: client UUIDs (idempotency keys — ADR-0003). Server entities: UUIDs.
- Timestamps: device timestamp AND server-receipt timestamp both stored (ADR-0017); ISO-8601 UTC.

## Relations sketch
Template 1—N TemplateVersion 1—N Session 1—N Op —1 Blob; Session 1—N Extraction (versioned); Org owns Sessions/Templates-overrides; Vendor owns Orgs.
