---
title: Release Gate Workflow
description: Audit workflow for producing a machine-readable Solana pre-deploy or pre-upgrade gate with PASS, FAIL, and SKIP checks.
---

# Release Gate Workflow

Use this workflow when the user asks whether a Solana program, upgrade, or audited fix is ready to ship. The output is an audit signoff artifact, not a deploy script.

Related references:

- [Release blocker checklist](../checklists/release-blocker-checklist.md)
- [Upgrade and governance](../taxonomy/upgrade-admin-governance.md)
- [Denial of service and compute](../taxonomy/dos-compute-budget.md)
- [Formal verification handoff](formal-verification-handoff.md)

## Status Contract

Use exactly these status labels:

1. `PASS`: direct evidence supports the check.
2. `FAIL`: the check exposes a release-blocking gap or unresolved high-risk assumption.
3. `SKIP`: the check is not applicable to this release, or the user explicitly scoped it out.

Do not use `SKIP` for missing evidence when the release depends on that evidence. If a mainnet release needs the check and no proof is available, mark it `FAIL` and name the evidence required to clear it.

## Gate Output Shape

```text
GATE: FAIL target=<program-or-release> blockers=2 warnings=1 skipped=1
CHECK: authority status=FAIL severity=High evidence="<what was reviewed>" action="<required fix or proof>"
CHECK: build status=PASS severity=Info evidence="<artifact or command result>" action="none"
CHECK: compute status=SKIP severity=Info evidence="<why not applicable>" action="none"
```

Every `FAIL` must map to a finding, remediation task, or explicit release blocker. Every `PASS` must name the artifact, command output, simulation, test, or review evidence that supports it.

## Required Inputs

Collect only what the release needs:

1. release target: deploy, upgrade, migration, feature enablement, or remediation signoff
2. reviewed commit, build artifact, program ID, cluster, and planned authority
3. upgrade authority, multisig, timelock, pause, and emergency-control evidence
4. binary provenance: local build artifact, deployed artifact, verified build output, or reproducibility notes
5. critical transaction simulations, compute-unit measurements, and failure cases
6. account size, rent, realloc, and account-layout diff evidence
7. rollback plan, prior binary retention, and migration recovery plan when upgrading live state
8. critical transaction landing evidence: finality target, blockhash expiry policy, bounded confirmation loop, rebroadcast behavior, RPC provider or slot-lag assumptions, and preserved simulation logs

## Gate Checks

### 1. Authority Custody

`PASS` when the upgrade authority is immutable, a documented multisig/governance authority, or otherwise matches the accepted trust model.

`FAIL` when a value-holding production program depends on an unexplained single signer, the deploy key is also the upgrade authority, the timelock claim is unproven, or emergency controls exceed the documented trust model.

`SKIP` only for non-upgradeable or non-production artifacts where no upgrade authority exists.

### 2. Build Provenance

`PASS` when the reviewed source, local binary, deployed binary, and release artifact are tied together by reproducible build evidence, binary dump comparison, signed release evidence, or an equivalent audit trail.

`FAIL` when the release cannot prove which source produced the binary that will be deployed or upgraded.

`SKIP` only when the work is not deploying program code, such as a documentation-only release.

### 3. Compute And Liveness Headroom

`PASS` when critical value-moving, admin, migration, close, claim, and emergency paths have realistic simulation or harness evidence showing bounded compute and no resource-sensitive denial-of-service path.

`FAIL` when a critical path is near runtime limits, loops over attacker-influenced accounts without bounds, depends on unwired simulation evidence, or can block withdrawals, claims, closes, or emergency controls.

`SKIP` only when the release has no executable program or transaction path in scope.

### 4. Account Size, Rent, And Realloc

`PASS` when program, buffer, account, and migration rent are funded; account sizes stay within platform limits; and realloc growth, shrink, and zeroing behavior are covered by tests or reviewed code.

`FAIL` when the release can underfund rent, exceed account limits, grow accounts without rent top-up, shrink across live data, or rely on ambiguous account sizing.

`SKIP` only when no program binary, account creation, account resizing, or migration is in scope.

### 5. Upgrade And Migration Lifecycle

`PASS` when live account layout changes are versioned, migration is idempotent and resumable, both old and new versions are handled during the migration window, fork or harness simulation covers real layouts, and a prior binary is retained for code rollback.

`FAIL` when a live account layout changes without a version tag, migration path, mixed-version strategy, fork simulation, pause guard, or rollback plan.

`SKIP` only when no live program upgrade or live account migration is planned.

### 6. Release Controls And Evidence

`PASS` when release owners can show the exact commands, signers, approvals, artifacts, tests, and monitoring needed to deploy, pause, roll back code, and verify remediation.

`FAIL` when signoff depends on manual memory, invisible off-chain policy, unavailable signers, missing previous artifacts, or a remediation claim that was not tested.

`SKIP` only for early audit planning where the deliverable is intentionally not a release decision.

### 7. Transaction Landing And RPC Evidence

`PASS` when value-moving, admin, migration, liquidation, claim, close, or emergency transaction paths distinguish forwarding from landing, preserve simulation logs for failed transactions, use an explicit finality target, stop on blockhash expiry, and document rebroadcast or rebuild behavior.

`FAIL` when a release treats `sendTransaction` or a returned signature as success, waits indefinitely for confirmation, retries expired transactions without rebuilding and resigning, hides simulation logs, or depends on a stale or single RPC endpoint without a documented fallback or residual-risk decision.

`SKIP` only when the release has no client, backend signer, relayer, keeper, or operational transaction path in scope.

## Reviewer Procedure

1. Classify the target and decide which checks apply.
2. Fill the gate line by line using `PASS`, `FAIL`, or `SKIP`.
3. Convert every `FAIL` into a release blocker with severity, owner, required evidence, and verification step.
4. Convert every risky but accepted non-blocker into `Residual Risk`.
5. Attach the final gate to the audit report, remediation signoff, or release-readiness note.

## Avoid These Mistakes

1. Treating a warning or missing artifact as a pass.
2. Marking authority risk as only informational when it contradicts the trust model.
3. Saying a migration is safe because tests pass on fresh accounts only.
4. Treating code rollback as data rollback.
5. Shipping a payment, token, or migration feature without the negative cases that would have caught underpayment, wrong token, replay, or account corruption.
