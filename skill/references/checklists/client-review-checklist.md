---
title: Client Review Checklist
description: Checklist for reviewing Solana client, wallet, and signing flows that can create security issues even when the on-chain program is sound.
---

# Client Review Checklist

Use this when the security boundary extends into the client or wallet flow.

## Signing surface

1. Check what the user is asked to sign and whether the prompt is legible.
Why it matters: blind-signing or vague signing prompts turn client code into the weak link.

2. Check whether the client distinguishes simulation from execution.
Why it matters: users should not be pushed directly to mainnet signing without a safe preview path.

3. Check cluster handling.
Why it matters: mislabelled or silently switched clusters can cause unsafe assumptions during rollout or incident response.

## Transaction construction

4. Check how program IDs, account metas, and recent blockhashes are sourced.
Why it matters: client bugs can route valid user intent into unsafe program invocations.

5. Check whether the client hardcodes Token assumptions.
Why it matters: Token-2022 extension semantics often break wallet and frontend assumptions even when the on-chain code is careful.

6. Check whether user-visible amounts match on-chain units and token decimals.
Why it matters: arithmetic and display mismatches can create practical signing-risk even when the transaction is technically valid.

## Supply chain and dependency boundary

7. Check wallet, SDK, and signing-library provenance.
Why it matters: the `@solana/web3.js` supply-chain incident showed that wallet-boundary risk is not purely on-chain.

8. Check whether off-chain message verification or replay prevention is explicit.
Why it matters: signature replay and weak message domain separation can move an auth bug from the program into the client.

## Operational safety

9. Check whether the release path defaults to devnet or local verification first.
Why it matters: unaudited mainnet execution should be opt-in and explicit, not the silent default.

10. Check incident-response hooks.
Why it matters: if a wallet or SDK issue emerges, the team should be able to pause signing flows, not just the program itself.
