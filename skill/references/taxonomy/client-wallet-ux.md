---
title: Client Wallet And Signing UX
description: Canonical Solana boundary-risk class for unsafe signing flows, dependency compromise, replayable approval patterns, and wallet UX that hides security-critical details.
---

# Client Wallet And Signing UX

## Aliases

- blind signing risk
- wallet boundary issue
- signing UX failure
- client supply-chain compromise
- replayable approval flow

## What The Bug Is

This class covers security failures that happen at the wallet, SDK, or transaction-construction boundary even when the on-chain program itself is sound.

## Why It Matters On Solana

Many Solana flows rely on clients to assemble account metas, fetch PDAs, select clusters, and present signing intent to the user. If the client or its dependencies are compromised, or if signers cannot see what they are signing, the security boundary moves off chain.

## Exploit Mechanics

1. The attacker compromises the signing stack, the dependency chain, or the signer's understanding of the request.
2. The user or admin signs a transaction or message they do not truly understand or control.
3. Valid on-chain logic executes an unsafe or unintended action.
4. Assets move or authorities are abused without an on-chain logic bug in the target program.

## Review Signals

1. Direct handling of private keys in app code or server code.
2. Blind-signing or batch-signing flows with weak inspection.
3. Durable nonce usage without replay-aware signing procedures.
4. Transitive dependencies that can build or sign transactions.

## Anchor Notes

1. This category is usually adjacent to, not inside, Anchor code.
2. Still review off-chain message formats and any instruction-introspection auth path in the program.
3. If the program depends on off-chain signatures, treat the message schema as part of the attack surface.

## Native Rust / Pinocchio Notes

1. If the program consumes signed messages, document the exact domain separation and replay protections.
2. Do not assume wallet UX will communicate nuance that the on-chain message format omits.

## Client/Wallet Implications

This category is mostly the client and wallet implication. Good wallet UX is a mitigation, not a luxury.

## Mitigation Guidance

1. Keep keys inside wallet-standard or hardware-backed signing flows.
2. Make signer intent inspectable.
3. Avoid durable nonce signing flows unless signers understand replay implications and can verify state.
4. Pin, audit, and monitor transaction-building dependencies.

## Public Examples

1. [web3.js Exploit: Root Cause Analysis (Anza)](https://www.anza.xyz/blog/web3-js-exploit-root-cause-analysis) - an official Solana ecosystem disclosure showing that client dependency compromise can directly lead to unauthorized transfers.
2. [Solana Multisig Security (Osec)](https://osec.io/blog/2025-02-22-multisig-security) - explains blind-signing and durable-nonce replay risk for Solana signers.
3. [Slope Wallet incident summarized by Sec3](https://www.sec3.dev/blog/recent-hacks) - a public incident reminder that wallet compromise sits outside the on-chain logic boundary but still dominates user risk.
