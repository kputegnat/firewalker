# ADR-0002: Capacitor-wrapped web app, not pure PWA
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
iOS PWAs allow silent IndexedDB eviction, halt sync when closed, and stop recording on screen lock. Scene evidence is unrepeatable; demo leads to pilot quickly, so native guarantees are needed from day one. [PDD §8.2]
## Decision
The client is a React/TS/Vite web app inside a Capacitor shell with OTA JS updates (Capgo). Camera, mic, filesystem, background upload use native plugins from the start.
## Consequences
Near-PWA iteration via OTA; native builds only on plugin/shell changes; app-store + MDM distribution paths available; requires Apple/Android accounts and CI build runners.
## Compliance check
Lint rule bans navigator.storage/IndexedDB imports in /app capture paths (gate 1); plugin usage reviewed at PR gate.
