---
title: Common False Positives
description: Solana review signals that often look dangerous at first glance but require additional conditions before they become real findings.
---

# Common False Positives

Some Solana audit signals are noisy. This file is a guardrail against over-reporting.

## 1. UncheckedAccount is not automatically a vulnerability

Why it is noisy:

1. many programs intentionally take `UncheckedAccount<'info>` and then validate owner, signer, seeds, or mint relationships manually
2. typed accounts are preferred, but manual validation can still be sound

What must be true before you report it:

1. the account reaches security-sensitive logic
2. the missing validation is exploitable, not merely deferred
3. there is no later owner, signer, discriminator, or relationship check that closes the path

## 2. Explicit program account parameters are not arbitrary CPI by themselves

Why it is noisy:

1. some programs pass a program account for flexibility or interface dispatch
2. Anchor `Program<'info, T>` or a direct program-id comparison may still make the CPI safe

What must be true before you report it:

1. the callee program ID is user-influenced
2. there is no strong type or explicit ID check
3. privileged signer seeds or writable accounts are forwarded to the untrusted callee

## 3. Admin power is not always a vulnerability

Why it is noisy:

1. some protocols intentionally centralize pause, upgrade, or fee controls
2. the correct writeup may be a trust-model note rather than a vulnerability

What must be true before you report it:

1. the implementation exceeds the documented trust model
2. there is no multisig, timelock, or governance gate where one is claimed
3. the admin path can unexpectedly seize user value or disable withdrawals

## 4. Token-2022 extension presence is not enough

Why it is noisy:

1. a mint having transfer fees, metadata pointers, or memo-required accounts is not itself a bug
2. the bug appears when the integration assumes classic SPL Token behavior

What must be true before you report it:

1. protocol accounting assumes 1:1 token movement
2. close, fee, or transfer paths ignore extension semantics
3. the integration fails to validate the actual mint or token program variant

## 5. Same-account parameters are not always duplicate mutable aliasing

Why it is noisy:

1. some instructions intentionally support self-transfer or same-recipient flows
2. not every repeated account creates a broken invariant

What must be true before you report it:

1. the instruction assumes distinct accounts
2. sequential writes can cancel or overwrite each other
3. reward, fee, or balance deltas become wrong when the same account is passed twice

## 6. Oracle risk needs a realistic manipulation path

Why it is noisy:

1. a low-liquidity market or custom price feed is not automatically exploitable
2. the report should show how the attacker moves the price or bypasses freshness checks

What must be true before you report it:

1. the oracle input is attacker-influenced or stale
2. the manipulated price reaches mint, borrow, redeem, or liquidation logic
3. there is no TWAP, confidence bound, or cross-check that blocks the exploit
