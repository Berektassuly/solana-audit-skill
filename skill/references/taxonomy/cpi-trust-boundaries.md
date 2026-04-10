---
title: CPI Trust Boundaries
description: Canonical Solana vulnerability class for arbitrary CPI, weak program-ID validation, and instruction-boundary failures around external programs and introspection.
---

# CPI Trust Boundaries

## Aliases

- arbitrary CPI
- untrusted program invocation
- weak program check
- instruction introspection mismatch
- arbitrary signed program invocation

## What The Bug Is

This class covers paths where the program calls an external program, trusts a prior verification instruction, or consumes introspected instruction data without proving that the external boundary is the one it intended to trust.

## Why It Matters On Solana

Composability is explicit on Solana. External program accounts are passed in by the caller, and instruction introspection can read data from other instructions in the same transaction. That makes program-ID checks, instruction-index checks, and signed-message binding security-critical.

## Exploit Mechanics

1. The attacker passes a different program account, or crafts a transaction where verification data and consumed data diverge.
2. The program trusts the external boundary without proving identity and context.
3. The callee or introspected instruction authorizes an unintended effect.
4. The invoking program performs privileged state changes or value movement on attacker-chosen terms.

## Review Signals

1. CPI target supplied as a raw account without explicit ID validation.
2. Instruction introspection code that reads offsets and indexes from user-reachable data.
3. CPIs that forward signer seeds or writable accounts to loosely-validated callees.
4. Native secp or ed25519 verification flows that validate "some signed bytes" but not the exact business message later consumed.

## Anchor Notes

1. Prefer `Program<'info, T>` or official CPI modules where possible.
2. If flexibility is intentional, compare program IDs explicitly before the CPI.
3. Review `remaining_accounts` carefully when they influence CPI targets or verification contexts.

## Native Rust / Pinocchio Notes

1. Compare `program_id` against the intended callee before invoking.
2. Validate instruction index, program ID, message length, and message offsets for introspection-based auth.
3. Reconstruct the exact business message from trusted data before trusting a prior verification instruction.

## Client/Wallet Implications

Wallets and clients often surface only the top-level program. That makes arbitrary CPI and instruction-introspection bugs especially dangerous because the user may never see which boundary was actually trusted.

## Mitigation Guidance

1. Prove callee identity before every CPI.
2. Bind introspected signatures to the exact target action and target object.
3. Forward only the signer seeds and writable accounts the callee actually needs.
4. Add tests that swap the callee program or mutate instruction indexes and offsets.

## Public Examples

1. [Arbitrary CPI - official Solana Program Security lesson](https://solana.com/developers/courses/program-security/arbitrary-cpi) - the official course demonstrates the exact trust-boundary failure.
2. [Audius Claimable Tokens - "Arbitrary authority modification in SetAuthority" (Zellic public findings)](https://reports.zellic.io/findings) - the exploit relied on mismatched secp verification and consumed instruction data.
3. [deBridge on Solana - Signature Verification Bypass (Neodyme)](https://neodyme.io/reports/debridge.pdf) - a public bridge review reinforcing verification-boundary risk.
4. [X-Ray common pitfalls include arbitrary signed program invocation (Sec3)](https://www.sec3.dev/blog/xray) - Sec3 names this class directly in its Solana vulnerability corpus.
