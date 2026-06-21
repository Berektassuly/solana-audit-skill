---
title: Audit Engagement Workflow
description: Step-by-step workflow for running a Solana audit engagement from intake to final findings using the normalized taxonomy in this repository.
---

# Audit Engagement Workflow

Use this workflow for a full Solana audit or readiness review. Each step builds on the previous one.

## Step 1: Scope the engagement

Collect:

1. program IDs, upgrade authority, and deployment targets
2. codebase type: Anchor, native Rust, client, wallet, or mixed stack
3. token and oracle dependencies
4. governance or emergency controls
5. release timeline and what is already deployed

If the user is still resolving architecture decisions, run [pre-audit-design-review.md](pre-audit-design-review.md) before full finding work. Design-stage review should produce assumptions, a threat model, a pre-audit checklist, and unresolved questions; it does not count as an audit pass.

## Step 2: Map the attack surface

Classify the reachable security surfaces:

1. account validation
2. signer and authority paths
3. PDA derivation and stored bump handling
4. CPI edges and external programs
5. token and oracle integrations
6. client and wallet signing boundaries

Do not start line-by-line review until this map exists.

## Step 3: Review by taxonomy

Read the relevant taxonomy files and inspect code in that order.

Examples:

1. fake-account or owner confusion risk -> `account-validation`
2. signer drift or delegated auth confusion -> `signer-authority`
3. token extension assumptions -> `token-integration`

## Step 4: Reproduce or falsify

For every plausible finding:

1. identify the required attacker-controlled accounts or parameters
2. check whether the runtime, Anchor typing, or later logic already blocks the path
3. reproduce locally or with a minimal thought experiment if the path stays open

## Step 5: Assign severity

Use [../severity-triage.md](../severity-triage.md) and state:

1. blast radius
2. replayability
3. cluster assumptions
4. whether the issue is a drain, liveness failure, governance risk, or trust-model gap

## Step 6: Write actionable findings

Each final finding should include:

1. exploit mechanic
2. Solana-specific why
3. public analogues from the corpus
4. minimal fix
5. verification steps

## Failure modes

1. starting with generic best practices instead of the target attack surface
2. treating all `UncheckedAccount` usage as equivalent
3. ignoring Token-2022 or governance dependencies until late in the review
4. giving severity labels without discussing replayability or blast radius
