---
title: Oracle Pricing And MEV Assumptions
description: Canonical Solana vulnerability class for manipulable prices, stale feeds, flash-loanable price inputs, and ordering assumptions in value-sensitive logic.
---

# Oracle Pricing And MEV Assumptions

## Aliases

- oracle manipulation
- stale price risk
- flash-loan price attack
- tick manipulation
- ordering assumption failure

## What The Bug Is

This class covers value-sensitive paths that trust a price, tick, or ordering assumption that an attacker can move, stale out, or sandwich.

## Why It Matters On Solana

Fast execution and composability make same-block economic manipulation practical. A program may have perfect auth and still be exploitable if it trusts an LP valuation, CLMM tick, or custom oracle update that can be shifted cheaply.

## Exploit Mechanics

1. The attacker moves or forges the pricing input.
2. The manipulated price reaches mint, borrow, redeem, liquidation, or reward logic.
3. The program executes using the bad price because freshness, confidence, or source validation is insufficient.
4. The attacker extracts value or forces bad settlement.

## Review Signals

1. Oracle data consumed without freshness or confidence checks.
2. LP token or CLMM valuations derived from attacker-influenced accounts.
3. Single-source prices used for borrow or redeem paths.
4. Quotes or redemptions that assume transaction ordering cannot be adversarial.

## Anchor Notes

1. Treat every price account as attacker-supplied until validated.
2. Re-check state after CPIs that can affect pools, vaults, or position state.
3. If a price is used in both user quoting and on-chain settlement, verify both paths share the same assumptions.

## Native Rust / Pinocchio Notes

1. Validate price account owner, feed identity, freshness, and confidence bounds.
2. Avoid mixing display math with settlement math.
3. Test flash-loan and same-slot manipulation scenarios explicitly.

## Client/Wallet Implications

Clients should expose slippage, minimum-out, and expiry protections. If the UI gives users a quote that the chain cannot enforce, the wallet flow inherits the MEV risk.

## Mitigation Guidance

1. Validate oracle source, freshness, and confidence.
2. Prefer resistant pricing schemes such as TWAPs or bounded cross-checks where appropriate.
3. Add min-out style user protections for value-sensitive operations.
4. Test same-transaction and same-slot manipulation paths.

## Public Examples

1. [Bypassing LP Token Oracles With Fake Token Accounts (Osec)](https://osec.io/blog/2022-10-10-lp-oracle-manipulation/) - a public Solana example of oracle manipulation via crafted LP state.
2. [Raydium Tick Manipulation Bug Fix Review (Immunefi)](https://immunefi.com/blog/bug-fix-reviews/raydium-tick-manipulation-bugfix-review/) - concentrated-liquidity pricing assumptions produced a real exploit path.
3. [Nirvana price manipulation summarized by Sec3](https://www.sec3.dev/blog/recent-hacks) - a public incident write-up where flash liquidity and internal pricing assumptions combined.
