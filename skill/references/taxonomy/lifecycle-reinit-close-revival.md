---
title: Lifecycle Reinitialization Close And Revival
description: Canonical Solana vulnerability class for unsafe account init, reinit, close, reopen, and rent-related lifecycle behavior.
---

# Lifecycle Reinitialization Close And Revival

## Aliases

- reinitialization attack
- close and revive
- zombie account
- rent-thief pattern
- init-if-needed hazard

## What The Bug Is

This class covers account lifecycle paths where initialization, closure, or rent handling let an attacker overwrite state, revive supposedly closed state, or profit from an incomplete lifecycle transition.

## Why It Matters On Solana

Account lifecycle is explicit on Solana. Accounts are funded, allocated, assigned, initialized, drained, and sometimes re-used across transactions. Small gaps between these stages can become exploitable because the runtime permits independent account creation, lamport movement, and later initialization.

## Exploit Mechanics

1. The attacker targets an account before or after its intended lifecycle transition.
2. The program assumes the account is uninitialized, closed, or unreachable.
3. The attacker reuses lamports, data, or timing to re-enter the lifecycle path.
4. Control or value is overwritten, revived, or stolen.

## Review Signals

1. `init_if_needed` on sensitive state.
2. Close paths that drain lamports but do not render revival impossible.
3. Assumptions that account creation and initialization happen atomically when they do not.
4. Reinit logic keyed only off zeroed data or lamport balance.

## Anchor Notes

1. Use `init` for one-time initialization where possible.
2. Treat `init_if_needed` as an explicit risk decision, not a default convenience.
3. Use `close =` carefully and test same-transaction revival attempts where relevant.

## Native Rust / Pinocchio Notes

1. Check initialization state before writing.
2. Make close logic drain lamports and invalidate future interpretation of the account data.
3. Handle prefunded PDAs and rent-exempt calculations explicitly.

## Client/Wallet Implications

Lifecycle bugs often surface operationally first. A client may see an account that looks closed or uninitialized even though the chain still permits a dangerous follow-up step.

## Mitigation Guidance

1. Make init and reinit conditions explicit.
2. Defend close paths against same-transaction or same-address revival.
3. Test prefunded accounts, repeated initialization, and cross-transaction create-then-init behavior.
4. Treat rent and lamport flows as part of the security model, not only as deployment plumbing.

## Public Examples

1. [Reinitialization Attacks - official Solana Program Security lesson](https://solana.com/developers/courses/program-security/reinitialization-attacks) - canonical example of overwriting existing state.
2. [Closing Accounts - official Solana Program Security lesson](https://solana.com/developers/courses/program-security/closing-accounts) - the official course covers secure close behavior and revival risk.
3. [The Story of the Curious Rent Thief (Osec)](https://osec.io/blog/2022-08-19-solend-rent-thief/) - a real-world lifecycle gap between account creation and initialization.
4. [PDA sharing and lifecycle lessons in the Solana Program Security course](https://solana.com/developers/courses/program-security) - comparable official material for closure and re-use hazards.
