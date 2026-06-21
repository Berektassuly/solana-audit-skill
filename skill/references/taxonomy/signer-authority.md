---
title: Signer And Authority Enforcement
description: Canonical Solana vulnerability class for missing signer checks, weak authority binding, replayable authority updates, and other authorization failures.
---

# Signer And Authority Enforcement

## Aliases

- missing signer check
- authority bypass
- arbitrary authority update
- replayable authority change
- weak authorization binding

## What The Bug Is

This class covers privileged instruction paths where the program fails to prove that the caller is the correct signer or the correct stored authority for the state being modified.

## Why It Matters On Solana

A public key passed into an instruction is just data until the runtime marks it as a signer. Even then, "signed" is not enough if the program never checks that the signer matches the stored authority, vault owner, admin, or delegate expected by the business logic.

## Exploit Mechanics

1. The attacker supplies an account whose key matches a stored field, or reuses a valid signature in a broader context.
2. The program checks only `is_signer`, or checks only a stored key, but not both together.
3. The authority path executes for the wrong account or for replayed signed data.
4. Control of assets or privileged state changes unexpectedly.

## Review Signals

1. Sensitive instructions that read an authority field but never compare it to the incoming signer.
2. Signed messages that do not bind the exact target account or action.
3. SetAuthority-style instructions that read secp or ed25519 verification results without validating offsets, indexes, or domain separation.
4. Admin updates that can be replayed across multiple token accounts or vaults.

## Anchor Notes

1. `Signer<'info>` proves signature presence, not authority correctness.
2. Pair signer checks with `has_one`, explicit key comparisons, or stored-authority validation.
3. Review delegated authority and admin rotation flows separately from one-time initialization flows.

## Native Rust / Pinocchio Notes

1. Check `is_signer` and compare the incoming key to the stored authority in the same path.
2. When using instruction introspection or secp verification, validate instruction indexes, offsets, and signed message contents explicitly.
3. For off-chain signed messages, bind the target account and operation into the signed payload.

## Client/Wallet Implications

Weak off-chain message binding can turn a client-side signing flow into an authorization vulnerability. The wallet may show a valid signature request while the on-chain program accepts the signature for a different target object.

## Mitigation Guidance

1. Require the right signer and prove the signer matches the right stored authority.
2. Bind message signatures to the exact target account, action, and replay domain.
3. Add nonce, blockhash, or durable domain separation carefully, but do not confuse those with target-account binding.
4. Test authority rotation, replay attempts, and cross-account replay explicitly.

## Public Examples

1. [Audius Claimable Tokens - "Arbitrary authority modification in SetAuthority" (Zellic public findings)](https://reports.zellic.io/findings) - secp instruction parsing was not tightly bound to the data later consumed by the program, enabling arbitrary authority change.
2. [Audius Claimable Tokens - "Signature replay in the SetAuthority instruction" (Zellic public findings)](https://reports.zellic.io/findings) - a valid signature could be replayed against a different token account derived from the same signer identity.
3. [Signer Authorization - archived Solana Program Security lesson](https://github.com/solana-foundation/developer-content/blob/main/content/courses/program-security/signer-auth.md) - demonstrates how a missing signer check can drain a vault path.
4. [deBridge on Solana - Signature Verification Bypass (Neodyme)](https://neodyme.io/reports/Debridge.pdf) - a public Neodyme report that reinforces signature-boundary review on Solana bridge logic.
