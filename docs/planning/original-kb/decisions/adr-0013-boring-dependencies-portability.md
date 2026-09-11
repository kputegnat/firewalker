# ADR-0013: Boring, gov-cloud-portable dependencies only
Status: Accepted   Date: 2026-09-06   Supersedes: none   Decided by: human (front door)
## Context
Deployment into vendor AWS (possibly GovCloud) is likely; exotic managed services are portability landmines. [PDD §9]
## Decision
Postgres, S3-compatible storage, SQS, ECS Fargate, Terraform. New infrastructure dependencies require an ADR demonstrating GovCloud/Azure-Gov availability.
## Consequences
"Run it in our environment" stays a deployment exercise; some commercial-cloud conveniences foregone.
## Compliance check
Terraform module review against the allowed-services list (plan gate for infra tasks).
