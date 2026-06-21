---
title: State Machine Invariants
description: Canonical Solana vulnerability class for instruction sequences that violate the protocol's intended state progression or business invariants.
---

# State Machine Invariants

## Aliases

- semantic inconsistency
- invalid state transition
- missing invariant enforcement
- business logic drift

## What The Bug Is

This class covers logic that is locally valid per instruction but globally invalid for the protocol's intended state machine. The bug is not necessarily missing auth or arithmetic; it is that the sequence of states becomes impossible, unfair, or unsafe.

## Why It Matters On Solana

Protocols often split a user flow across multiple instructions, transactions, and PDAs. If the program does not defend the intended progression, attackers can create states that were never meant to coexist or race one state update against another.

## Exploit Mechanics

1. The attacker reaches a legal-looking instruction entry point.
2. The program mutates state without proving the full invariant that should hold.
3. Subsequent instructions interpret the abnormal state as valid.
4. Claims, withdrawals, pricing, or governance behavior breaks.

## Review Signals

1. Initialization or settlement paths that do not assert phase or status.
2. Admin updates that can front-run user deposits or withdrawals.
3. Cross-instruction assumptions stored only in comments or tests.
4. State transitions that depend on external programs but do not revalidate after CPI.

## Anchor Notes

1. Encode phase transitions directly in account data where possible.
2. Re-check critical state after CPIs if the callee can mutate shared state.
3. Treat "admin can update fees anytime" as a potential business-logic vulnerability, not just a governance note.

## Account Reloading After CPI

Anchor does not automatically refresh deserialized account data after a CPI. If a program reads account state after a CPI that modified that account, it operates on stale data. The pattern is analogous to a cache-consistency bug: the in-memory representation diverges from the on-chain state.

Additionally, `realloc` called multiple times within one transaction with `zero_init: false` on a shrink-then-grow sequence can expose stale memory in the newly reallocated region. This is distinct from a pure business-logic bug; it is a memory-model hazard specific to account resizing and cached state handling.

Review signals:

1. Account data read after `invoke`, `invoke_signed`, or an Anchor CPI helper call without an explicit `.reload()` call.
2. `realloc` called with `zero_init: false` after a prior shrink in the same transaction.

Sources: [Helius - A Hitchhiker's Guide to Solana Program Security](https://www.helius.dev/blog/a-hitchhikers-guide-to-solana-program-security), [Cantina - Solana Security Risks, Issues & Mitigation Guide](https://cantina.xyz/blog/securing-solana-a-developers-guide), [Beyond the Audit: The Hidden Risks of Upgrading Solana Programs](https://www.linkedin.com/pulse/beyond-audit-hidden-risks-upgrading-solana-programs-tushar-32fqc).

## Native Rust / Pinocchio Notes

1. Prefer small explicit enums or status bytes over ad hoc boolean combinations.
2. Write helper validators for phase-specific preconditions and use them consistently.
3. When status and economic values interact, test the full sequence, not just each instruction in isolation.

## Client/Wallet Implications

Clients often surface a stale state snapshot. If the invariant can change between quote and execution, the UI must include slippage or minimum-out style protections.

## Mitigation Guidance

1. State the invariant in plain language before coding or auditing the path.
2. Enforce phase and status preconditions at every transition.
3. Use slippage or min-out style protections when admin or market state can change between quote and execution.
4. Add sequence tests that model front-running, retries, and partial failure.

## Public Examples

1. [Solana Stake Pool - inconsistent initialization vulnerability discovered by Sec3](https://www.sec3.dev/blog/solana-stake-pool-a-semantic-inconsistency-vulnerability-discovered-by-x-ray) - a direct example of state-machine inconsistency in a major Solana program.
2. [Pye - fee can be front-run on deposit/withdraw (Zellic)](https://reports.zellic.io/publications/pye/sections/fee-can-be-front-run-on-depositwithdraw-fee-frontrunning) - the public write-up shows how state updates and user expectations diverge when fee settings can move between quote and execution.
3. [Program Security course archive](https://github.com/solana-foundation/developer-content/tree/main/content/courses/program-security) - the archived official course groups reinitialization, duplicate mutable accounts, and PDA handling as stateful exploit classes rather than isolated syntax errors.
