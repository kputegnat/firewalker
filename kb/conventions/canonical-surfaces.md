# Canonical Surfaces Registry
<!-- Budget: 300 lines. Owner file for the paved-road registry: one canonical surface per cross-cutting concern, the lint denial that enforces it, and the exception register. -->
<!-- STATUS: ACCEPTED (owner, 2026-09-15) — BINDING per ADR-0019. Seeded from planned architecture; surfaces flip from PLANNED to LIVE as their package gains code. -->
<!-- Governance: changes to this file — new surfaces, altered denials, exception rows — land only with owner approval (owner merge = approval). No agent self-grants. -->
<!-- Rule: a cross-cutting concern present in the codemap with no row here is a curator finding. Adding a surface is cheap; removing a lint denial requires a superseding ADR. -->

## The registry

| ID | Concern | Canonical surface | Everything that MUST route through it | Raw primitive denied by lint | Cites |
|---|---|---|---|---|---|
| CS-1 | On-device storage | `/app/src/storage/storage.plugin.ts` (adapter interface; native + browser implementations behind it) | Every read/write of ops and evidence blobs on device, both delivery targets | `localStorage`, `sessionStorage`, `indexedDB`, `navigator.storage`, OPFS, direct `@capacitor/filesystem` import outside `/app/src/storage/**` | ADR-0004, ADR-0002 |
| CS-2 | Op append path | `/app/src/storage/op-log.service.ts` — the sole `appendOp` | Every capture op: voice, photo, selection, text, skip, observation, annotation, session lifecycle | Direct writes to op-log paths; any op mutation; `update`/`delete` verbs on op surfaces | ADR-0003, ADR-0017 |
| CS-3 | Evidence write + checksum | `/app/src/storage/evidence.service.ts` — writes blob, computes SHA-256, returns payload ref | Every media write (photo, audio, video) and every checksum computation over evidence | `crypto.subtle.digest` outside the module; direct media file writes | ADR-0017, ADR-0004 |
| CS-4 | Sync / upload queue | `/app/src/sync/` | All op-batch upload, media upload, receipt handling, retry/backoff, queue-state reads | Ad hoc upload calls; hand-rolled retry loops outside the queue | ADR-0003, R-021/022/023 |
| CS-5 | API client | `/app/src/api/client.ts` (typed from `/shared` zod) | Every HTTP call originating in `/app` | `fetch`, `XMLHttpRequest`, `axios` anywhere in `/app` outside the client | ADR-0014, PDD §10 |
| CS-6 | Error envelope | `/shared/src/error.schema.ts` + `/api/src/error.plugin.ts` | Every error response from `/api`; every error surfaced client-side | Hand-built error response objects; thrown string literals | kb/conventions/error-handling.md, PDD §10 |
| CS-7 | Config access | `/shared/src/config.ts` (zod-validated at boot) | Every environment/config read, including per-vendor build config | `process.env` / `import.meta.env` outside the config module | ADR-0012, ADR-0013 |
| CS-8 | Logging | `/shared/src/logger.ts` (structured) | All logging in `/app`, `/api`, `/pipeline`, including sync-queue state | `console.*` outside the logger module | R-091, PDD §8.9 |
| CS-9 | Auth / session check | `/api/src/auth/auth.plugin.ts` | Every authenticated route; resolution of the caller's org context | Inline token verify/decode; direct authorization-header reads in routes | R-081/083, ADR-0011 |
| CS-10 | Tenant-scoped data access | `/api/src/{domain}/{entity}.repository.ts` | Every database query; org scoping applied here and nowhere else | SQL / query-builder calls in routes or services | ADR-0011, ADR-0014 |
| CS-11 | Vendor mapping | `/api/src/vendor-mapping/` | Every translation between internal model and vendor schema | Vendor schema type imports outside the module | ADR-0010 |
| CS-12 | Design tokens | `/shared/src/design-tokens.schema.ts` + `/app` token file | Every color, size, spacing, radius, duration in UI | Raw hex/rgb/px literals in `/app` components and CSS Modules | ADR-0018 |
| CS-13 | Model invocation | `/pipeline/src/ai/bedrock.plugin.ts`, `/pipeline/src/ai/transcribe.plugin.ts` | Every model call; model ID + prompt version recorded at this boundary | Direct Bedrock/Transcribe SDK client construction outside the wrappers | ADR-0007, ADR-0009, R-032 |

Status: all rows PLANNED (greenfield). A row goes LIVE when its module exists; its lint rule binds in the same PR as the module, never later.

## Exception register
Exceptions are owner-approved rows. A pragma citing an ID absent from this table fails gate 1. Format in code, immediately above the deviating line:

`// paved-road-exception: CS-EX-001 — <one-line reason>`

| Exception ID | Surface | Scope (paths) | Justification | Approved | Expires |
|---|---|---|---|---|---|
| — | — | — | none yet | — | — |

## Appendix — gate 1 lint bindings (for the engine to bind)
ESLint flat config, scoped by `files`/`ignores` so each canonical module is exempt from its own denial.

```js
// CS-1 + CS-5: all of /app except the canonical modules
{ files: ['app/src/**/*.{ts,tsx}'],
  ignores: ['app/src/api/client.ts', 'app/src/storage/**'],
  rules: {
    'no-restricted-globals': ['error',
      { name: 'fetch',          message: 'CS-5: use /app/src/api/client.ts' },
      { name: 'XMLHttpRequest', message: 'CS-5: use /app/src/api/client.ts' },
      { name: 'localStorage',   message: 'CS-1: use /app/src/storage' },
      { name: 'sessionStorage', message: 'CS-1: use /app/src/storage' },
      { name: 'indexedDB',      message: 'CS-1: use /app/src/storage (ADR-0004)' }],
    'no-restricted-imports': ['error', { patterns: [
      { group: ['@capacitor/filesystem'], message: 'CS-1: only /app/src/storage may import it' },
      { group: ['axios'],                 message: 'CS-5: use the API client' }]}],
    'no-restricted-syntax': ['error',
      { selector: "MemberExpression[object.name='navigator'][property.name='storage']",
        message: 'CS-1: OPFS/quota API denied outside the storage adapter' },
      { selector: "MemberExpression[object.object.name='crypto'][object.property.name='subtle']",
        message: 'CS-3: checksums are computed in evidence.service.ts' },
      { selector: "Literal[value=/^#(?:[0-9a-fA-F]{3,4}){1,2}$/]",
        message: 'CS-12: use design tokens, not raw color literals' }]}}

// CS-7: everywhere except the config module
{ files: ['{app,api,pipeline,shared}/src/**/*.ts'], ignores: ['shared/src/config.ts'],
  rules: { 'no-restricted-properties': ['error',
    { object: 'process', property: 'env', message: 'CS-7: read config from /shared/src/config.ts' }]}}

// CS-8: everywhere except the logger
{ files: ['{app,api,pipeline,shared}/src/**/*.{ts,tsx}'], ignores: ['shared/src/logger.ts'],
  rules: { 'no-console': 'error' }}

// CS-10: layering — no query surface in routes or services
{ files: ['api/src/**/*.{routes,service}.ts'],
  rules: { 'no-restricted-imports': ['error', { patterns: [
    { group: ['pg', 'kysely', 'drizzle-orm'], message: 'CS-10: queries live in the repository layer' }]}]}}

// CS-11: vendor types fenced
{ files: ['{app,api,pipeline,shared}/src/**/*.ts'], ignores: ['api/src/vendor-mapping/**'],
  rules: { 'no-restricted-imports': ['error', { patterns: [
    { group: ['**/vendor-schema/**'], message: 'CS-11: vendor types import only inside vendor-mapping (ADR-0010)' }]}]}}
```

**Not coverable by ESLint — `harness/scripts/paved-road-check.mjs` (new, invoked from gate 1):**
1. **Pragma validation** — every `paved-road-exception:` cites a registry ID that exists, sits within that exception's declared scope paths, and is unexpired.
2. **Suppression coverage** — every `eslint-disable*` of a `no-restricted-*` rule carries a pragma on the same or preceding line.
3. **CSS Modules scan** — raw hex/rgb/px literals in `app/src/**/*.module.css` (CS-12); ESLint does not parse CSS.
4. **Registry drift** — each module path named above exists exactly once, and no second module declares the same concern.

## Appendix — self-attack fixtures (bind with the gate, not after)
The paved-road machinery is fixture-tested like every other gate (ADR-0019). Each fixture plants a defect, asserts gate 1 **fails with the named rule**, then reverts and asserts the suite is **clean**. A fixture that does not fire is itself a gate failure — silent enforcement is the failure mode this whole mandate exists to prevent.

| ID | Planted defect | Must fire | Failing check | Expected message contains |
|---|---|---|---|---|
| SA-PR-1 | Bare `fetch('/v1/ping')` added to an `/app/src` file outside `app/src/api/client.ts` | gate 1 | ESLint `no-restricted-globals` | `CS-5: use /app/src/api/client.ts` |
| SA-PR-2 | `// paved-road-exception: CS-EX-999 — testing` above any deviating line, with no `CS-EX-999` row in the registry | gate 1 | `paved-road-check.mjs` (pragma validation) | unknown exception id `CS-EX-999` |
| SA-PR-3 | `// eslint-disable-next-line no-restricted-globals` above a `localStorage.setItem(...)` call, with no pragma on or above it | gate 1 | `paved-road-check.mjs` (suppression coverage) | suppression of a restricted rule without a cited exception |

Runner contract, per fixture: plant → run the gate suite → assert non-zero exit **and** the expected message → `git checkout --` the planted file → re-run → assert clean exit. SA-PR-3 is the load-bearing one: without it the entire mandate is one `eslint-disable` comment away from bypass.

Extension rule: **every new registry row ships with a fixture that proves its denial fires.** A surface whose lint rule has never been observed failing is unverified, not enforced.
