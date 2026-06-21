---
title: Pre-Audit Design Review
description: Design-stage Solana review workflow for reading the code first, resolving architecture questions in dependency order, and producing audit-ready assumptions, threat-model, checklist, and unresolved-question artifacts.
---

# Pre-Audit Design Review

Use this workflow before a full audit when the user wants design risk reduction, threat modeling, or audit readiness for a Solana or Anchor program. This is not an audit pass and should not be presented as one.

Related references:

- [Pre-audit intake checklist](../checklists/pre-audit-intake.md)
- [Audit engagement workflow](audit-engagement-workflow.md)
- [Program review checklist](../checklists/program-review-checklist.md)
- [Client review checklist](../checklists/client-review-checklist.md)
- [Final audit report template](final-audit-report-template.md)

## Step 1: Read Before Asking

Inspect the codebase or design material first:

1. program directories, `Anchor.toml`, `Cargo.toml`, IDL, and deployment notes
2. instruction handlers and account structs
3. PDA seeds, bumps, signer constraints, `UncheckedAccount`, `remaining_accounts`, and CPI calls
4. token interfaces, Token-2022 use, mint assumptions, and client or backend signing flows
5. upgrade authority, governance, pause, migration, and release notes

Only ask a human question when the code or docs cannot answer it. If code answers the question, state the observed answer and ask for confirmation only when the trust model is unclear.

## Step 2: Resolve Branches In Dependency Order

Walk design branches in this order:

1. accounts and PDAs
2. authority and signers
3. CPI and external program trust
4. state, data layout, init, realloc, close, and lifecycle
5. economic invariants, accounting, oracle, and rounding
6. upgrade, governance, admin, pause, and migration controls
7. compute, account growth, transaction size, and denial-of-service limits
8. token, Token-2022, mint, fee, hook, and close semantics
9. client integration, wallet prompts, backend signer policy, and transaction safety

Resolve gating questions early: whether the program moves value, uses external CPIs, supports Token-2022, remains upgradeable, or depends on off-chain signers.

## Step 3: Ask One Design Question At A Time

Each unresolved question should include:

1. the code or design evidence that raised it
2. the risk if the decision remains unresolved
3. a recommended default answer
4. a one-line reason for the recommendation
5. the artifact that will record the answer

Example shape:

```text
Question: Should this vault authority PDA be scoped per market or global?
Evidence: `withdraw` signs token transfers with the vault authority PDA.
Recommended default: per-market PDA.
Reason: it prevents authority from one market being reused over another market's funds.
Blocks: PDA map, authority matrix, token transfer tests.
```

Do not dump a long questionnaire. Resolve the current decision, update the ledger, then move to the next dependent decision.

## Step 4: Maintain A Findings Ledger

Track every resolved issue or open decision:

| ID | Branch | Severity | Decision | Status | Residual risk |
|---|---|---|---|---|---|
| D-01 | accounts/PDA | High | Store canonical bump and bind PDA to market | Open | alternate address confusion until fixed |

Use these statuses:

1. `Open`: unresolved and still blocks audit readiness
2. `Accepted`: team agreed to implement the recommendation
3. `Deferred`: team accepts delay; record release impact
4. `Resolved`: evidence shows the design or code handles it
5. `Accepted Risk`: team intentionally keeps the risk; record rationale

Severity should follow [../severity-triage.md](../severity-triage.md). Keep hypotheses separate from confirmed audit findings.

## Step 5: Produce Audit-Native Artifacts

Produce compact artifacts that a later audit can consume:

1. `Design Assumptions`: account model, PDA map, authority matrix, token policy, invariants, governance assumptions, client signing assumptions
2. `Threat Model`: attacker capabilities, trust assumptions, findings ledger, status, and residual risk
3. `Pre-Audit Checklist`: code evidence required before audit, tests still missing, release blockers, and verification targets
4. `Unresolved Questions`: one question at a time, each with recommended default, reason, owner, and due date or blocker status

Store these in the user's requested location or return them in the response. Do not introduce a repository-specific output directory unless the target project already uses one.

## Hand-Off Criteria

The design review is ready to hand off to an audit when:

1. every Critical or High design question is `Resolved`, `Accepted`, or explicitly `Accepted Risk`
2. the account model, PDA map, authority matrix, token policy, CPI map, and upgrade/governance model are written down
3. each remaining residual risk has an owner and a report-ready explanation
4. negative tests are planned for signer, account, CPI, Token-2022, lifecycle, and transaction-safety assumptions that matter to the design

End with a clear limitation: design risk has been reduced, but no codebase is certified secure by this workflow.
