# Error Handling
<!-- Budget: 200 lines. Owner file for error patterns, envelopes, logging. -->
<!-- STATUS: PROPOSED — greenfield conventions (chosen, not inferred), consistent with Fastify + zod (ADR-0014) and the uncertainty posture (ADR-0008). Binding on first /api code unless superseded. -->

## API error envelope (proposed)
```json
{ "error": { "code": "SESSION_NOT_FOUND", "message": "human-readable", "details": [] } }
```
- `code`: SCREAMING_SNAKE, closed per-domain registry in /shared (zod enum) — clients switch on code, never on message.
- HTTP mapping: 400 validation (zod issues in `details`), 401/403 auth/tenancy, 404 missing, 409 idempotency/version conflict, 422 domain rule, 5xx unexpected (no internals leaked).

## Rules (proposed)
1. Boundary validation: every route parses input through its /shared schema; unvalidated data never reaches services.
2. No silent catch: a caught error is either handled meaningfully (state named in a comment) or rethrown enriched. Empty catch blocks are lint failures.
3. Op ingestion is idempotent, never "duplicate error": replayed ops return their original receipt (ADR-0003).
4. AI uncertainty is NOT an error: below-threshold confidence flags fields for review (ADR-0008); pipeline stage failures are retried/dead-lettered (R-051 pattern), never swallowed.
5. Evidence-integrity failures (checksum mismatch on ingestion, R-025) are hard rejects with per-op receipt status — never partial-accept.
6. Logging: structured JSON (R-091), incl. client sync-queue state; no PII/evidence payloads in logs; error logs carry `code` + correlation id.
