# Pipeline — how work flows
<!-- Budget: 100 lines. Pointer doc into the pinned engine's runbooks; content lives THERE. -->

The delivery machinery is the harness engine, pinned at **v0.9.1**, running on the engine box (`/home/engine/harnessengine`, detached at the tag; systemd `engine.service`, `--root` = this repo).

Binding documents (in the engine checkout, `docs/`):
- `runbooks/kb-protocol.md` — read/write rules per agent, budgets, ownership
- `runbooks/gates-and-hooks.md` — gate suite, baseline policy, self-attack fixture list
- `runbooks/delivery-loop.md` — lifecycle states, retries, merge queue
- `agents/orchestrator.md` — loop, state files (`harness/state/`), LLM call points
- `SYSTEM_INTEGRATION.md` §7/§7a — enforcement bindings and the permissions matrix

Product-side bindings live here: `harness/config.json` (width, gates, agentCommands, timeouts, breakers — ADR-gated commits, never live edits), `harness/scripts/` (gate scripts, agent wrappers, hooks), `.claude/agents/` (agent definitions), `.claude/permissions/` (per-agent permission configs per §7a).

Calibration state: **width 0 — nothing dispatches.** Engine pin bumps and width changes are owner decisions recorded as ADRs.
