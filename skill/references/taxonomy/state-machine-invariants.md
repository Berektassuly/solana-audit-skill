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
3. [Program Security course index](https://solana.com/developers/courses/program-security) - the official course groups reinitialization, duplicate mutable accounts, and PDA handling as stateful exploit classes rather than isolated syntax errors.
