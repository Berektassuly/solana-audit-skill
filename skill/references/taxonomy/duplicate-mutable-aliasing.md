---
title: Duplicate Mutable Aliasing
description: Canonical Solana vulnerability class for passing the same mutable account more than once into logic that assumes distinct state objects.
---

# Duplicate Mutable Aliasing

## Aliases

- duplicate mutable accounts
- same-account aliasing
- repeated mutable account
- distinct-account assumption failure

## What The Bug Is

This class covers instructions that take multiple mutable accounts of the same type, assume they are distinct, and then perform updates that become wrong if the same account is supplied twice.

## Why It Matters On Solana

The runtime does not infer that two account parameters should be different. If the program does not check distinctness, the same account can satisfy both parameters and receive multiple sequential writes that were meant for separate objects.

## Exploit Mechanics

1. The attacker supplies the same mutable account in multiple parameters.
2. The instruction computes deltas under the assumption that the accounts are distinct.
3. Sequential writes overwrite or double-apply state transitions.
4. Rewards, fees, balances, or invariants become wrong.

## Review Signals

1. Two mutable accounts of the same type with no inequality check.
2. Business logic that credits one account while debiting another.
3. Fee-vault and user-vault updates in the same instruction.
4. Reward distribution or settlement instructions with symmetric mutable inputs.

## Anchor Notes

1. Add `constraint = account_a.key() != account_b.key()` when distinctness matters.
2. Review `dup` usage very carefully. It should be intentional and rare.
3. Anchor v1 now rejects many accidental duplicate mutable patterns, but older code and unchecked paths still need manual review.

## Native Rust / Pinocchio Notes

1. Compare keys explicitly before mutating.
2. For loops over mutable accounts, consider whether duplicate keys are possible and harmful.
3. Test same-account inputs even if the instruction "obviously" expects distinct roles.

## Client/Wallet Implications

Clients may accidentally hide this bug if they always derive distinct accounts. Attackers do not need to follow the client path.

## Mitigation Guidance

1. Assert distinct account identities where the invariant needs them.
2. Keep updates small and easy to reason about.
3. Add regression tests that pass the same mutable account twice.

## Public Examples

1. [Duplicate Mutable Accounts - official Solana Program Security lesson](https://solana.com/developers/courses/program-security/duplicate-mutable-accounts) - the canonical public example of the class.
2. [A Hitchhiker's Guide to Solana Program Security - Duplicate Mutable Accounts section](https://www.helius.dev/blog/a-hitchhikers-guide-to-solana-program-security) - a second Solana-specific public corpus entry that explains the exploit shape and mitigation.
