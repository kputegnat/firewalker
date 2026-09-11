# ADR-0009: Bedrock (Claude) for extraction; Amazon Transcribe first for STT, bake-off pending
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Vendor runs in AWS with an accepted AI posture; gov-cloud portability constrains providers; STT quality on fireground audio is unproven. [PDD §9.1, §8.5]
## Decision
Extraction uses Bedrock-hosted Claude. STT uses Amazon Transcribe (custom vocabulary, word confidence) unless the dirty-audio bake-off (vs self-hosted Whisper, one commercial API) fails it; prompts stay model-portable.
## Consequences
Audio never leaves the AWS boundary; provider agreements inheritable from vendor; bake-off result may swap the STT engine behind the pipeline interface without redesign.
## Compliance check
Pipeline stage interface isolates STT engine (review); bake-off result recorded as superseding ADR if the default changes.
