---
title: PDA Seeds And Bumps
description: Canonical Solana vulnerability class for noncanonical bump handling, weak seed domain separation, and PDA reuse across privilege domains.
---

# PDA Seeds And Bumps

## Aliases

- bump seed not validated
- noncanonical bump acceptance
- PDA sharing
- weak domain separation
- seed collision

## What The Bug Is

This class covers PDA derivation logic that accepts multiple valid addresses for what should be a single logical object, or reuses the same PDA namespace across users, markets, mints, or authorities that should stay isolated.

## Why It Matters On Solana

PDAs are a core authorization primitive. Programs rely on PDA determinism to identify escrow accounts, vault authorities, receipts, and governance records. If bumps are not canonical or seeds are underspecified, attackers can steer the program toward a different valid PDA or cause unrelated users to share privilege.

## Exploit Mechanics

1. The program derives or validates a PDA with underspecified seeds or a user-chosen bump.
2. The attacker supplies an alternate valid PDA or exploits a shared namespace.
3. Authorization or accounting logic treats the PDA as the expected object.
4. Assets or privileges bleed across logical domains.

## Review Signals

1. `create_program_address` used directly with user-controlled bump input.
2. Stored bump values that are never revalidated.
3. Seeds that omit user, market, mint, or destination context.
4. One PDA authority reused across multiple users or pools.

## Anchor Notes

1. Use `seeds` plus `bump` constraints consistently and store the canonical bump at initialization time.
2. If a PDA represents a per-user or per-market object, include the domain identifier in the seeds.
3. Beware of "convenient" shared authorities that simplify CPI signing but collapse trust boundaries.

## Native Rust / Pinocchio Notes

1. Prefer `find_program_address` during initialization and store the resulting bump.
2. On later instructions, recompute the expected address from the stored bump and compare it to the incoming account.
3. Use explicit seed comments so reviewers can tell whether the namespace is per user, per mint, per vault, or global.

## Client/Wallet Implications

If the client derives PDAs differently from the program, bugs can look intermittent and be dismissed as UX issues. Treat PDA derivation code as security-critical shared logic.

## Mitigation Guidance

1. Use canonical bump derivation.
2. Store and recheck the bump on subsequent calls.
3. Include enough seed context to keep privilege domains separate.
4. Add tests for alternate bumps, reused seeds, and cross-user collisions.

## Public Examples

1. [Bump Seed Canonicalization - official Solana Program Security lesson](https://solana.com/developers/courses/program-security/bump-seed-canonicalization) - documents why noncanonical bumps break one-to-one PDA mapping.
2. [PDA Sharing - official Solana Program Security lesson](https://solana.com/developers/courses/program-security/pda-sharing) - shows how a shared PDA signer can let one user withdraw assets that belong to another.
3. [Security of Solana Smart Contracts: Why You Should Always Validate PDA Bump Seeds (Sec3)](https://www.sec3.dev/blog/pda-bump-seeds) - a direct Sec3 write-up on the vulnerability class.
4. [Exploring Solana Core Part 1 - Neodyme](https://neodyme.io/en/blog/solana_core_1/) - explains how PDA signer privileges become dangerous when the derived authority domain is too broad.
