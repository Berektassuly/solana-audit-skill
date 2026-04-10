---
title: ZK Proof Soundness
description: Canonical Solana vulnerability class for soundness failures in native zero-knowledge proof verifiers that higher-level programs treat as trusted validation boundaries.
---

# ZK Proof Soundness

Public finding density for this class is currently thin. This file covers only the documented mechanic.

## Aliases

- Fiat-Shamir transcript bug
- phantom challenge
- ZK soundness failure
- confidential transfer proof forgery
- proof verifier trust-boundary failure

## What The Bug Is

This class covers failures in the ZK ElGamal Proof Program where the verifier accepts a forged proof because its Fiat-Shamir transcript omits a prover-controlled component. In the June 2025 incident, a sigma-OR proof subcomponent was missing from the transcript hash, allowing a malicious prover to supply a phantom challenge and pass verification for unauthorized confidential-transfer actions.

## Why It Matters On Solana

Programs that integrate Token-2022 Confidential Transfers depend on a native proof verifier they do not control. If that verifier has a soundness bug, higher-level protocols inherit it automatically. The incident demonstrated that "native program" is not the same thing as "infallible trust boundary" for asset security.

## Exploit Mechanics

1. A non-interactive proof is built using the Fiat-Shamir transformation, where the verifier challenge is derived from hashing the full public transcript.
2. A prover-controlled algebraic component is omitted from that transcript hash.
3. The attacker chooses the omitted component after seeing the challenge, producing a forged proof that still satisfies the verifier.
4. The proof program accepts unauthorized confidential-transfer actions such as unlimited minting or draining encrypted balances.

## Review Signals

1. A protocol treats ZK proof verification as a transparent helper rather than a separate trust boundary.
2. Critical accounting paths rely solely on confidential-transfer proof success without secondary invariant checks or kill switches.
3. Integration logic assumes any future proof-program upgrade is automatically safe.
4. Feature rollout or incident-response procedures lack a way to pause confidential-transfer-dependent paths quickly.

## Anchor Notes

1. Anchor provides no protection here because the vulnerable component is an external native verifier program.
2. When an Anchor program integrates Confidential Transfers, review the proof verifier and the Token-2022 program as distinct trust boundaries.
3. Do not confuse typed accounts with verifier correctness; the failure mode is cryptographic soundness, not account deserialization.

## Native Rust / Pinocchio Notes

1. Native programs are equally exposed if they trust proof-program success as sufficient authorization.
2. Pin proof-program identity and feature assumptions explicitly where possible, and document the operational dependency.
3. Add defense-in-depth checks around balances, caps, or disable switches for flows that depend on confidential proofs.

## Client/Wallet Implications

Clients and wallets cannot independently validate ZK proof soundness from transaction metadata alone, and confidential balances further reduce operator visibility. Integrators should therefore treat confidential-transfer enablement as a high-trust feature flag and communicate pause or disable conditions clearly to users.

## Mitigation Guidance

1. Treat the ZK proof program as an explicit trust boundary in threat models and audits.
2. Pin program IDs and operational assumptions for Confidential Transfer integrations.
3. Add secondary balance or supply invariant checks where practical instead of relying on proof success alone.
4. Maintain rapid pause or feature-disable procedures for confidential-transfer-dependent logic.
5. Monitor upstream advisories for proof-program changes and validator-coordination events.

## Public Examples

1. [Uncovering the Phantom Challenge Soundness Bug in Solana's ZK ElGamal Proof Program](https://blog.zksecurity.xyz/posts/solana-phantom-challenge-bug/) - the primary technical post-mortem describing the missing transcript component and the phantom challenge exploit mechanic.
2. [Post Mortem: ZK ElGamal Proof Program Bug, June 2025](https://solana.com/news/post-mortem-june-25-2025) - Solana Foundation's disclosure of the second soundness issue, coordinated disablement, and the absence of known exploitation.
3. [Post Mortem: ZK ElGamal Proof Program Bug](https://solana.com/ru/news/post-mortem-may-2-2025) - the earlier Solana Foundation disclosure showing the same verifier boundary had already required emergency patching in May 2025.
4. [Confidential Transfer](https://solana.com/docs/tokens/extensions/confidential-transfer) - official documentation for the Token-2022 feature that depends on the ZK ElGamal proof verifier.
