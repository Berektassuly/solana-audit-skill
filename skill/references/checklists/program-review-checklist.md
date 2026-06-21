---
title: Program Review Checklist
description: Structured Solana on-chain review checklist organized by the canonical taxonomy classes in this repository.
---

# Program Review Checklist

Use this checklist during on-chain review. Work category by category instead of reading the whole program as undifferentiated Rust.

## A. Account validation

A1. Verify owner, discriminator, data length, and relationship checks on every attacker-influenced account.
Why it matters: Wormhole, Cashio, Crema, and many workshop exploits begin with fake or mismatched accounts.

A2. Check whether manual validation is complete when `UncheckedAccount` is used.
Why it matters: partial validation often looks safe until one missing relationship check unlocks the exploit.

## B. Signer and authority

B1. Verify that every privileged action checks the right signer, not just any signer.
Why it matters: SetAuthority-style bugs often come from checking a signer without checking that it is the stored authority.

B2. Verify authority transitions and delegated authority paths.
Why it matters: replayable or overbroad authority updates can turn an operational path into a takeover path.

## C. PDAs and seeds

C1. Verify canonical bump handling and stored bump validation.
Why it matters: noncanonical bump acceptance creates alternate valid PDAs and weakens address-based invariants.

C2. Verify domain separation in seeds.
Why it matters: PDA sharing across users, vaults, or mints can merge privilege domains that were meant to stay separate.

## D. CPI boundaries

D1. Verify every CPI target program ID.
Why it matters: Solana composability makes arbitrary CPI one of the highest-value review surfaces.

D2. Verify signer seeds and writable accounts forwarded to callees.
Why it matters: even a trusted target becomes dangerous if privileged accounts are forwarded too broadly.

## E. Token and oracle integrations

E1. Verify token program variant, mint identity, token-account relationships, and extension assumptions.
Why it matters: transfer fees, memo-required accounts, metadata pointers, freeze authority, and permanent delegate semantics change the threat model.

E2. Verify the Token-2022 support policy when any accepted mint may use Token-2022.
Why it matters: the integration should explicitly mark extensions as supported, rejected, or residual risk before value movement or accounting.

E3. Verify fee-bearing and hook-bearing mints with balance-delta and callback-aware tests.
Why it matters: gross sent may not equal net received, and a transfer can introduce external hook execution or liveness failure.

E4. Verify oracle freshness, confidence, and manipulability.
Why it matters: price-dependent bugs often combine stale or attacker-influenced inputs with correct-looking business logic.

## F. Arithmetic and invariants

F1. Verify checked math, rounding direction, and balance-delta accounting.
Why it matters: stable-swap rounding bugs and accounting drift can leak value without obvious overflow panics.

F2. Write down the intended invariant before reviewing the branch.
Why it matters: state-machine bugs often hide in logic that is locally correct but globally inconsistent.

## G. Lifecycle and closure

G1. Verify init, reinit, close, and reopen paths.
Why it matters: rent-thief, reinit, and revival attacks exploit lifecycle assumptions rather than arithmetic or auth directly.

G2. Verify same-account alias hazards where the instruction expects distinct accounts.
Why it matters: duplicate mutable aliasing can silently invalidate deltas and overwrite earlier writes.
