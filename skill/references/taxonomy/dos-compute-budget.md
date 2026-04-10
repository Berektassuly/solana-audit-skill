---
title: Denial Of Service And Compute Budget
description: Canonical Solana vulnerability class for liveness failures, griefing paths, dust-based blocking, and compute-sensitive execution assumptions.
---

# Denial Of Service And Compute Budget

## Aliases

- liveness failure
- griefing
- dust attack
- compute-sensitive denial of service
- blocking condition

## What The Bug Is

This class covers instruction paths that can be made to revert, exhaust resources, or become economically or operationally unusable without necessarily violating authorization or arithmetic invariants first.

## Why It Matters On Solana

Solana programs execute under explicit compute and account-loading limits. Attackers can exploit edge conditions, dust balances, repeated ordering, or resource-heavy paths to block users even when they cannot directly steal funds.

## Exploit Mechanics

1. The attacker creates a state that is valid enough to persist but hostile to later execution.
2. A user or operator calls the normal path.
3. The path fails because of dust, ordering, write-demotion, or resource assumptions.
4. Withdrawals, claims, closes, or other important operations become blocked.

## Review Signals

1. Close paths that assume zero balance without defending against dust.
2. Loops over attacker-influenced account sets or position counts.
3. Logic that assumes writable accounts stay writable across the effective execution path.
4. Operations whose success depends on narrow compute or loaded-data limits.

## Anchor Notes

1. Treat denial-of-service findings as first-class if they block withdrawals, claims, close paths, or emergency actions.
2. Model attacker-created dust and same-slot front-running in tests.
3. Review any loop over `remaining_accounts` or dynamic account lists for griefing potential.

## Native Rust / Pinocchio Notes

1. Keep close and rescue paths simple and bounded.
2. Validate assumptions about writability before lamport movement or account resizing.
3. Consider account-loading and data-size ceilings when loops or dynamic CPIs are involved.

## Client/Wallet Implications

Users often experience these issues as "transaction keeps failing" rather than as a security bug. The client should surface whether the failure is state-dependent and whether user action can clear it.

## Mitigation Guidance

1. Design bounded loops and bounded dynamic account handling.
2. Defend close and claim paths against dust.
3. Add liveness tests for griefing and resource exhaustion scenarios.
4. Treat write-demotion and account-loading assumptions as part of the security review.

## Public Examples

1. [Audius Claimable Tokens - claimable token close can be subjected to denial of service via dust attack (Zellic index)](https://reports.zellic.io/findings) - a direct public finding title for Solana close-path griefing.
2. [Pye - fee can be front-run on deposit/withdraw (Zellic)](https://reports.zellic.io/publications/pye/sections/fee-can-be-front-run-on-depositwithdraw-fee-frontrunning) - user actions can be sandwiched into effectively unusable outcomes without stealing protocol admin keys.
3. [The Hidden Dangers of Lamport Transfers (Osec)](https://osec.io/blog/2025-05-14-king-of-the-sol/) - demonstrates how writable-account assumptions can turn into liveness failures or mis-execution.
