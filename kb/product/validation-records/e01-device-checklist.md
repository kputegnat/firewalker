# E01 Device-Validation Checklist
<!-- Working state (validation-records). Owner signs each entry at milestone validation; the E01 readiness record and PRD AC [device] tags reference these DV-IDs. -->
<!-- PARKED with readiness-record-E01 (owner, 2026-09-17): device legs are native/pilot scope; the browser prototype (ADR-0020) exercises none of them. -->
<!-- Channel decision (owner, Phase C): locked tests run at mocked-plugin logic level on Linux runners; emulator smoke once per epic pre-milestone (non-blocking); THIS list runs on physical hardware at milestone validation. When unattended runs begin, add a nightly non-blocking emulator job. -->

Status: PENDING — E01 not yet at milestone. Both platforms = physical iOS + Android devices.

| DV | Req | Check | iOS | Android | Signed |
|---|---|---|---|---|---|
| DV-1 | R-005 | Full R-003 template completed end to end on device | ☐ | ☐ | |
| DV-2 | R-005 / ADR-0018 | All capture flows operable wearing work gloves | ☐ | ☐ | |
| DV-3 | ADR-0018 | Screens legible in direct sunlight (light theme) and at night scene (dark theme) | ☐ | ☐ | |
| DV-4 | ADR-0018 | Capture confirmations produce haptic + visual feedback | ☐ | ☐ | |
| DV-5 | R-006 | Real 60s voice recording with mid-recording screen lock → one complete op, audio playable | ☐ | ☐ | |
| DV-6 | R-007 | Real photo capture carries real device timestamp, GPS, compass heading | ☐ | ☐ | |
| DV-7 | R-008 | Entire template completed in airplane mode; all ops valid on disk | ☐ | ☐ | |
| DV-8 | R-009 | Force-kill mid-session; relaunch shows N ops, resumable at prompt N+1 | ☐ | ☐ | |
| DV-9 | R-013 | On-site GPS acquisition; verify/mismatch behavior; acquisition-timeout handling | ☐ | ☐ | |
| DV-10 | R-014 | Annotate a real capture with gloves; original blob checksum intact | ☐ | ☐ | |

Rules: an entry passes only when checked on BOTH platforms; failures route to triage as bugs (never silently retried into a pass); the milestone validation record cites this file's final state.
