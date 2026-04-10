---
title: Solana Severity Triage
description: Severity rubric for Solana audit findings that weighs authority compromise, value leakage, replayability, liveness impact, and operational blast radius.
---

# Solana Severity Triage

Severity on Solana is often determined by what the attacker can pass into an instruction, which authorities they can fake or reuse, and whether the bug is replayable across accounts, pools, or governance surfaces.

## Critical

Use `Critical` when the finding plausibly enables one of these outcomes without heroic assumptions:

1. arbitrary minting, burning, or vault drainage
2. forged bridge message acceptance
3. signer or authority bypass that lets an attacker take over assets or privileged state
4. complete governance or upgrade compromise
5. exploit paths that can be repeated cheaply across user accounts or markets

## High

Use `High` when the issue can cause major loss or permanent control failure but needs some precondition:

1. replayable signed message abuse
2. oracle manipulation with realistic liquidity or flash-loan assumptions
3. incorrect token-extension handling that lets an attacker bypass accounting or freeze assumptions
4. admin or multisig mistakes with a limited but serious blast radius

## Medium

Use `Medium` when the issue is exploitable or materially unsafe, but one of these is true:

1. losses are partial or path-specific
2. attack preconditions are meaningful
3. liveness failure is important but not protocol-fatal
4. the bug mostly enables stale-state abuse, griefing, or partial accounting loss

## Low

Use `Low` when the issue is real but mostly hardening, operator risk, or narrow-edge behavior:

1. centralization or trust assumptions that are already explicit
2. confusing token identity handling with no immediate asset-loss path
3. weak close-path or fee-path behavior that needs a second flaw for real impact
4. undocumented assumptions that increase review burden

## Solana-specific escalation checks

Raise severity by one level if any of these are true:

1. the exploit can be repeated across arbitrary user-provided accounts
2. the vulnerable path sits behind a CPI or oracle boundary that many upstream programs call
3. the bug affects Token-2022 extensions that many integrators mis-handle
4. the issue survives transaction simulation and can be hidden in ordinary user flows
5. the bug touches upgrade authority, emergency authority, or a signer aggregator

## Solana-specific downgrade checks

Lower severity only if you can show one of these:

1. the account type is trusted and unreachable by attacker-controlled inputs
2. the token program is strongly typed and the suspicious program substitution cannot occur
3. the state branch is admin-only and the trust model already states the operator can do the action
4. the issue is blocked by a stronger invariant elsewhere in the same call graph

## Writeup guidance

Every final finding should state:

1. the primary exploit step
2. the Solana-specific reason the bug is reachable
3. the blast radius
4. whether the bug is replayable
5. the minimum fix that closes the path
