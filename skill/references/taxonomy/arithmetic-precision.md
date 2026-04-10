---
title: Arithmetic Precision And Accounting
description: Canonical Solana vulnerability class for overflow, underflow, rounding, accounting drift, and value leakage in token, oracle, and pool logic.
---

# Arithmetic Precision And Accounting

## Aliases

- integer overflow
- rounding bug
- bidirectional rounding
- accounting drift
- value leakage

## What The Bug Is

This class covers value-moving logic where arithmetic, rounding direction, or accounting assumptions let the attacker extract profit, strand funds, or skew balances over time.

## Why It Matters On Solana

Solana programs often encode pool math, collateral conversion, fee logic, and token accounting directly in the program. The runtime does not save the program from logically profitable round trips, precision loss, or unchecked large-value conversions.

## Exploit Mechanics

1. The attacker chooses amounts that hit a profitable rounding or overflow edge.
2. The program mints, redeems, swaps, or accrues using asymmetric or unsafe math.
3. The attacker repeats the edge or amplifies it with flash liquidity.
4. Value leaks out of the protocol or accounting becomes unrecoverably wrong.

## Review Signals

1. Same rounding direction used in both directions of a conversion pair.
2. Unsafe casts and unchecked arithmetic near token amounts or share conversions.
3. Display-unit or fee math reused as settlement math.
4. Balance accounting based on expected amounts instead of observed deltas.

## Anchor Notes

1. `checked_*` helpers prevent panic-class bugs, but not economic logic errors.
2. Review share minting, redemption, fee accrual, and reward distribution as a closed system.
3. If a CPI transfer can apply fees, measure actual token deltas rather than assuming exact movement.

## Native Rust / Pinocchio Notes

1. Keep amount types narrow and explicit.
2. Avoid `as` casts on amounts and decimals.
3. Model round-trip behavior directly in tests, not just one-way success cases.

## Client/Wallet Implications

Clients that display expected output using simplified math can hide a leak or slippage bug until users start extracting value or reporting loss.

## Mitigation Guidance

1. Use monotonic rounding policies that cannot be profitably reversed.
2. Track observed balance deltas for token movements.
3. Add round-trip and edge-amount tests.
4. Treat nonstandard decimals and fee-bearing tokens as hostile inputs during review.

## Public Examples

1. [Jet Protocol arithmetic overflow discovered by Sec3 X-Ray](https://www.sec3.dev/blog/solana-bug-bounty-hunting-with-x-ray) - a public bug bounty disclosure for unsafe arithmetic on Solana.
2. [Bidirectional Rounding: A Common Security Vulnerability in DeFi Smart Contracts (Sec3)](https://www.sec3.dev/blog/bidirectional-rounding) - includes an SPL token-lending example attributed to Neodyme and explains the round-trip exploit pattern.
3. [Raydium Liquidity Drain Bug Fix Review (Immunefi)](https://immunefi.com/blog/all/raydium-liquidity-drain-bug-fix-review/) - shows how pool accounting edge cases can become extraction paths.
4. [Pye - fee can be front-run on deposit/withdraw (Zellic)](https://reports.zellic.io/publications/pye/sections/fee-can-be-front-run-on-depositwithdraw-fee-frontrunning) - public report material on accounting and fee-path exploitation.
